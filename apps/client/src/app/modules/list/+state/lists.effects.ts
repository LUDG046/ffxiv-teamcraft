import { Injectable } from '@angular/core';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { ListService } from '../list.service';
import {
  CreateList,
  CreateOptimisticListCompact,
  DeleteList,
  ListDetailsLoaded,
  ListsActionTypes,
  ListsWithWriteAccessLoaded,
  LoadListDetails,
  MyListsLoaded,
  SetItemDone,
  UpdateList,
  UpdateListIndex
} from './lists.actions';
import { catchError, debounceTime, distinctUntilChanged, filter, map, switchMap, withLatestFrom } from 'rxjs/operators';
import { AuthFacade } from '../../../+state/auth.facade';
import { TeamcraftUser } from '../../../model/user/teamcraft-user';
import { combineLatest, concat, EMPTY, of } from 'rxjs';
import { ListsFacade } from './lists.facade';
import { ListCompactsService } from '../list-compacts.service';
import { List } from '../model/list';
import { PermissionLevel } from '../../../core/database/permissions/permission-level.enum';

@Injectable()
export class ListsEffects {

  @Effect()
  loadMyLists$ = this.actions$.pipe(
    ofType(ListsActionTypes.LoadMyLists),
    switchMap(() => this.authFacade.userId$),
    distinctUntilChanged(),
    switchMap((userId) => {
      return this.listCompactsService.getByForeignKey(TeamcraftUser, userId);
    }),
    map(lists => new MyListsLoaded(lists))
  );

  @Effect()
  loadListsWithWriteAccess = this.actions$.pipe(
    ofType(ListsActionTypes.LoadListsWithWriteAccess),
    switchMap(() => this.authFacade.userId$),
    distinctUntilChanged(),
    switchMap((userId) => {
      return this.listCompactsService.getWithWriteAccess(userId);
    }),
    map(lists => new ListsWithWriteAccessLoaded(lists))
  );

  @Effect()
  loadListDetails$ = this.actions$.pipe(
    ofType(ListsActionTypes.LoadListDetails),
    withLatestFrom(this.listsFacade.allListDetails$),
    filter(([action, allLists]) => allLists.find(list => list.$key === (<LoadListDetails>action).key) === undefined),
    map(([action]) => action),
    switchMap((action: LoadListDetails) => {
      return combineLatest(
        of(action.key),
        this.authFacade.userId$,
        this.listService.get(action.key).pipe(catchError(() => of(null)))
      );
    }),
    distinctUntilChanged(),
    map(([listKey, userId, list]: [string, string, List]) => {
      if (list !== null && list.getPermissionLevel(userId) >= PermissionLevel.READ) {
        return [listKey, list];
      }
      return [listKey, null];
    }),
    map(([key, list]: [string, List]) => {
      if (list === null) {
        return new ListDetailsLoaded({ $key: key, notFound: true });
      }
      return new ListDetailsLoaded(list);
    })
  );

  @Effect()
  createOptimisticListCompact$ = this.actions$.pipe(
    ofType(ListsActionTypes.CreateOptimisticListCompact),
    withLatestFrom(this.listsFacade.myLists$),
    map(([action, lists]) => {
      (<CreateOptimisticListCompact>action).payload.$key = (<CreateOptimisticListCompact>action).key;
      delete (<CreateOptimisticListCompact>action).payload.items;
      return new MyListsLoaded([...lists, (<CreateOptimisticListCompact>action).payload]);
    })
  );

  @Effect()
  persistUpdateListIndex$ = this.actions$.pipe(
    ofType(ListsActionTypes.UpdateListIndex),
    map(action => action as UpdateListIndex),
    switchMap(action => concat(
      this.listCompactsService.update(action.payload.$key, { index: action.payload.index }),
      this.listService.update(action.payload.$key, { index: action.payload.index })
    )),
    switchMap(() => EMPTY)
  );

  @Effect()
  createListInDatabase$ = this.actions$.pipe(
    ofType(ListsActionTypes.CreateList),
    withLatestFrom(this.authFacade.userId$),
    map(([action, userId]) => {
      (<CreateList>action).payload.authorId = userId;
      return (<CreateList>action).payload;
    }),
    switchMap(list => this.listService.add(list)
      .pipe(
        map((key) => new CreateOptimisticListCompact(list, key)))
    )
  );

  @Effect()
  updateListInDatabase$ = this.actions$.pipe(
    ofType(ListsActionTypes.UpdateList),
    debounceTime(500),
    map(action => action as UpdateList),
    switchMap(action => this.listService.update(action.payload.$key, action.payload)),
    switchMap(() => EMPTY)
  );

  @Effect()
  deleteListFromDatabase$ = this.actions$.pipe(
    ofType(ListsActionTypes.DeleteList),
    map(action => action as DeleteList),
    switchMap(action => this.listService.remove(action.key)),
    switchMap(() => EMPTY)
  );

  @Effect()
  updateItemDone$ = this.actions$.pipe(
    ofType<SetItemDone>(ListsActionTypes.SetItemDone),
    withLatestFrom(this.listsFacade.selectedList$, this.authFacade.mainCharacter$),
    map(([action, list, character]) => {
      list.modificationsHistory.push({
        amount: action.doneDelta,
        date: Date.now(),
        itemId: action.itemId,
        itemIcon: action.itemIcon,
        characterId: character ? character.ID : -1
      });
      return [action, list];
    }),
    map(([action, list]: [SetItemDone, List]) => {
      list.setDone(action.itemId, action.doneDelta, !action.finalItem);
      return list;
    }),
    map(list => new UpdateList(list))
  );

  constructor(
    private actions$: Actions,
    private authFacade: AuthFacade,
    private listService: ListService,
    private listCompactsService: ListCompactsService,
    private listsFacade: ListsFacade
  ) {
  }
}
