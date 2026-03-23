import { useMutation, useQuery } from "@tanstack/react-query";
import { documentsApi } from "@/features/documents/services/documents.api";
import type { UploadDocumentInput } from "@/features/documents/types/document.types";

export function useDocumentCategories() {
  return useQuery({
    queryKey: ["document-categories"],
    queryFn: () => documentsApi.listCategories(),
  });
}

export function useUploadDocument() {
  return useMutation({
    mutationFn: (payload: UploadDocumentInput) => documentsApi.upload(payload),
  });
}

export function useAnalyzeDocument() {
  return useMutation({
    mutationFn: (documentId: string) => documentsApi.analyze(documentId),
  });
}
