export type {
  Client,
  ClientType,
  TaxReturn,
  ReturnStatus,
  Document,
  ReturnField,
  FieldState,
  AIFlag,
  FlagStatus,
} from "./types";

export { mockClients } from "./mock-clients";
export { mockReturns } from "./mock-returns";
export { mockDocuments } from "./mock-documents";
export { mockFields } from "./mock-fields";
export { mockFlags } from "./mock-flags";
export {
  mockCollaborationThreads,
  threadsForReturn,
  hasOpenClientRequest,
} from "./mock-collaboration";
export type {
  CollaborationThread,
  ThreadVisibility,
  ThreadStatus,
} from "./mock-collaboration";
