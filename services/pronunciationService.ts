import { BASE_URL } from './chatService';
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

  const res = await fetch(`${BASE_URL}/api/analysis/pronunciation`, {
    method: 'POST',
    body: formData,
  });

  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json() as Promise<AiResponseDto>;
}
