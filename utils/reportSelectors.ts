import { ChatApiResponse, ReportApiResponse } from '@/types/api';
import { mapReportViewModel, ReportViewModel } from '@/utils/mappers';

export type { ReportViewModel };

export interface ReportDisplayViewModel extends ReportViewModel {
  correctionCount: number;
}

export function buildReportDisplayViewModel(
  response: ChatApiResponse | ReportApiResponse
): ReportDisplayViewModel {
  const vm = mapReportViewModel(response);
  return {
    ...vm,
    correctionCount: vm.corrections.length,
  };
}
