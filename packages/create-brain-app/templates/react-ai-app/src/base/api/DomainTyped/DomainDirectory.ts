export enum ApiParamType {
  GLOBAL = 1,
  PERSONAL = 2
}
export class CreateDirectoryRequest {
  name: string = '';
  type?: ApiParamType = ApiParamType.PERSONAL;
}

export class CreateDirectoryResponse {
  id: string = '';
  name: string = '';
  parentId: number = 0;
  created: number = 0;
  updated: number = 0;
}

export class UpdateDirectoryRequest {
  id: string = '';
  name: string = '';
  parentId?: number = 0;
}

export class UpdateDirectoryResponse {
  id: string = '';
  name: string = '';
  parentId: number = 0;
  created: number = 0;
  updated: number = 0;
}

export class DeleteDirectoryRequest {
  directoryId: string = '';
}

export class DeleteDirectoryResponse {
  success: boolean = false;
}

export class GetTreeStructureRequest {
  type: number = 2;
}

export class TreeItem {
  id: number = 0;
  name: string = '';
  nodeType: TreeTypes = TreeTypes.DIRECTORY;
  children: TreeItem[] = [];
}

export enum TreeTypes {
  DIRECTORY = 1,
  DOCUMENT = 2
}

export class GetTreeStructureResponse {
  items: TreeItem[] = [];
  types: TreeTypes = TreeTypes.DIRECTORY;
}

export class DocumentItem {
  id: string = '';
  parentId: string = '';
  name: string = '';
  content: string = '';
}

export class CreateDocumentRequest {
  parentId: string = '';
  name: string = '';
  description: string = '';
  content: string = '';
  type?: ApiParamType = ApiParamType.PERSONAL;
}

export class UpdateDocumentRequest {
  id: string = '';
  name: string = '';
  description: string = '';
  content: string = '';
  enable: boolean = false;
  parentId: string = '';
}

export class DeleteDocumentRequest {
  id: string = '';
}

export class DeleteDocumentResponse {
  content: string = '';
  id: string = '';
}

export class DocumentDetail {
  id: string = '';
  name: string = '';
  description: string = '';
  content: string = '';
  parentId: string = '';
  created: number = 0;
  updated: number = 0;
  enable: boolean = false;
}
