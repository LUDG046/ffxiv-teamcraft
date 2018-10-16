import { Action } from '@ngrx/store';
import { List } from '../model/list';

export enum ListsActionTypes {
  LoadMyLists = '[Lists] Load My Lists',

  LoadListsWithWriteAccess = '[Lists] Load Lists With Write Access',

  LoadListDetails = '[Lists] Load List',
  SelectList = '[Lists] Select List',

  SetItemDone = '[Lists] Set Item Done',

  MyListsLoaded = '[Lists] My Lists Loaded',
  ListsWithWriteAccessLoaded = '[Lists] Lists With Write Access Loaded',
  ListDetailsLoaded = '[Lists] List Details Loaded',


  CreateList = '[Lists] Create List',
  CreateOptimisticListCompact = '[Lists] Create List Compact',
  UpdateList = '[Lists] Update List',
  UpdateListIndex = '[Lists] Update List Index',
  DeleteList = '[Lists] Delete List',
}

export class LoadMyLists implements Action {
  readonly type = ListsActionTypes.LoadMyLists;
}

export class LoadListsWithWriteAccess implements Action {
  readonly type = ListsActionTypes.LoadListsWithWriteAccess;
}

export class LoadListDetails implements Action {
  readonly type = ListsActionTypes.LoadListDetails;

  constructor(public readonly key: string) {
  }
}

export class SelectList implements Action {
  readonly type = ListsActionTypes.SelectList;

  constructor(public readonly key: string) {
  }
}

export class SetItemDone implements Action {
  readonly type = ListsActionTypes.SetItemDone;

  constructor(public readonly itemId: number, public readonly itemIcon: number,
              public readonly finalItem: boolean, public readonly doneDelta: number) {
  }
}

export class MyListsLoaded implements Action {
  readonly type = ListsActionTypes.MyListsLoaded;

  constructor(public payload: List[]) {
  }
}

export class ListsWithWriteAccessLoaded implements Action {
  readonly type = ListsActionTypes.ListsWithWriteAccessLoaded;

  constructor(public payload: List[]) {
  }
}

export class ListDetailsLoaded implements Action {
  readonly type = ListsActionTypes.ListDetailsLoaded;

  constructor(public payload: Partial<List>) {
  }
}

export class CreateList implements Action {
  readonly type = ListsActionTypes.CreateList;

  constructor(public readonly payload: List) {
  }
}

export class CreateOptimisticListCompact implements Action {
  readonly type = ListsActionTypes.CreateOptimisticListCompact;

  constructor(public readonly payload: List, public readonly key: string) {
  }
}

export class UpdateList implements Action {
  readonly type = ListsActionTypes.UpdateList;

  constructor(public readonly payload: List, public readonly updateCompact = false) {
  }
}

export class UpdateListIndex implements Action {
  readonly type = ListsActionTypes.UpdateListIndex;

  constructor(public readonly payload: List) {
  }
}

export class DeleteList implements Action {
  readonly type = ListsActionTypes.DeleteList;

  constructor(public readonly key: string) {
  }
}

export type ListsAction =
  LoadMyLists
  | MyListsLoaded
  | CreateList
  | UpdateList
  | DeleteList
  | LoadListDetails
  | SelectList
  | SetItemDone
  | ListDetailsLoaded
  | CreateOptimisticListCompact
  | UpdateListIndex
  | LoadListsWithWriteAccess
  | ListsWithWriteAccessLoaded;
