import { ChatApiResponse } from '@/types/api';
import { mapReportViewModel, ReportViewModel } from '@/utils/mappers';

export type { ReportViewModel };

export interface ReportDisplayViewModel extends ReportViewModel {
  correctionCount: number;
}

export function buildReportDisplayViewModel(
  response: ChatApiResponse
): ReportDisplayViewModel {
  const vm = mapReportViewModel(response);
  return {
    ...vm,
    correctionCount: vm.corrections.length,
  };
}
