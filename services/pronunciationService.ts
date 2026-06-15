import { api } from './api';
import { AiRequestDto, AiResponseDto } from '@/types/api';

export async function analyzePronunciation(
  dto: AiRequestDto,
  localAudioUri: string | null,
): Promise<AiResponseDto> {
  const formData = new FormData();

  if (localAudioUri) {
    formData.append('audioFile', {
      uri: localAudioUri,
      type: 'audio/m4a',
      name: 'audio.m4a',
    } as unknown as Blob);
  }

  formData.append('request', JSON.stringify(dto));

  const res = await api.post<AiResponseDto>('/api/analysis/pronunciation', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });

  return res.data;
}
