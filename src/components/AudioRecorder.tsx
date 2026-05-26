import React, { useState, useRef } from 'react';
import { Mic, StopCircle, AlertCircle } from 'lucide-react';

const AudioRecorder: React.FC = () => {
  const [recording, setRecording] = useState(false);
  const [audioURL, setAudioURL] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  // Determine a MIME type that the browser supports for audio recording
  const getSupportedMime = () => {
    const mimeOptions = [
      'audio/webm;codecs=opus',
      'audio/webm',
      'audio/ogg;codecs=opus',
      'audio/ogg',
    ];
    for (const mime of mimeOptions) {
      if (MediaRecorder.isTypeSupported(mime)) return mime;
    }
    return '';
  };

  const startRecording = async () => {
    setErrorMsg(null);
    try {
      // Prompt the user for microphone access – must be triggered by a user gesture and on a secure context (HTTPS)
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mime = getSupportedMime();
      const recorder = new MediaRecorder(stream, mime ? { mimeType: mime } : undefined);
      mediaRecorderRef.current = recorder;
      audioChunksRef.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };
      recorder.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: mime || 'audio/webm' });
        const url = URL.createObjectURL(blob);
        setAudioURL(url);
      };
      recorder.onerror = (e) => {
        console.error('Recorder error', e);
        setErrorMsg('Error durante la grabación.');
      };
      recorder.start();
      setRecording(true);
    } catch (err) {
      console.error('Error accessing microphone', err);
      setErrorMsg('No se pudo acceder al micrófono. Verifique permisos y que la página esté bajo HTTPS.');
    }
  };

  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
    setRecording(false);
  };

  const download = () => {
    if (!audioURL) return;
    const a = document.createElement('a');
    a.href = audioURL;
    a.download = `recording_${Date.now()}.webm`;
    a.click();
  };

  return (
    <div className="flex flex-col items-center gap-2 mt-4">
      <button
        onClick={recording ? stopRecording : startRecording}
        className={`flex items-center gap-2 px-4 py-2 rounded-xl ${recording ? 'bg-red-500/20 border border-red-500' : 'bg-[#4be277]/10 border border-[#4be277]/20'} hover:bg-[#4be277]/20 transition`}
      >
        {recording ? <StopCircle className="w-5 h-5 text-red-500" /> : <Mic className="w-5 h-5 text-[#4be277]" />}
        <span className="text-sm font-black uppercase">{recording ? 'Detener' : 'Grabar Audio'}</span>
      </button>
      {errorMsg && (
        <div className="flex items-center gap-2 text-red-500 mt-1">
          <AlertCircle className="w-4 h-4" />
          <span className="text-xs">{errorMsg}</span>
        </div>
      )}
      {audioURL && (
        <div className="flex items-center gap-2 mt-2">
          <audio controls src={audioURL} className="w-48" />
          <button onClick={download} className="text-xs font-black uppercase text-[#4be277] underline">
            Descargar
          </button>
        </div>
      )}
    </div>
  );
};

export default AudioRecorder;
