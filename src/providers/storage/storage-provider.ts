export interface PresignedUploadUrl {
  uploadUrl: string;
  storageKey: string;
}

export interface StorageProvider {
  presignUpload(params: {
    organizationId: string;
    churchId?: string;
    entityType: string;
    entityId?: string;
    filename: string;
    contentType: string;
    contentLength: number;
  }): Promise<PresignedUploadUrl>;

  getDownloadUrl(storageKey: string): Promise<string>;

  deleteFile(storageKey: string): Promise<void>;
}
