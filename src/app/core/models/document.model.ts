/**
 * Document URL Response from backend
 */
export interface DocumentUrlResponse {
    id?: string;
    url: string;
    nomDocument: string;
    type: string;
    tailleBytes?: number;
    expiresDans: string;
}

/**
 * Document Upload Response
 */
export interface DocumentUploadResponse {
    id: string;
    nomDocument: string;
    type: string;
    tailleBytes: number;
    expiresDans: string;
}
