import api from "@/lib/http";
import type { DocumentAnalysisResult, DocumentCategoryOption, UploadDocumentInput } from "@/features/documents/types/document.types";

export const documentsApi = {
  listCategories: async (): Promise<DocumentCategoryOption[]> => {
    const response = await api.get<DocumentCategoryOption[]>("/documents/categories");
    return response.data;
  },

  analyze: async (documentId: string): Promise<DocumentAnalysisResult> => {
    const response = await api.get<DocumentAnalysisResult>(`/documents/${documentId}/analysis`);
    return response.data;
  },

  upload: async (payload: UploadDocumentInput): Promise<string> => {
    const formData = new FormData();
    formData.append("workId", payload.workId);
    formData.append("categoryId", payload.categoryId);
    formData.append("file", payload.file);

    const response = await api.post<string>("/documents/upload", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    return response.data;
  },
};
