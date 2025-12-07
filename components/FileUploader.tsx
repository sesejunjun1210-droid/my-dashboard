import React, { useState, useCallback } from 'react';
import { Upload, FileText, AlertCircle, CheckCircle } from 'lucide-react';
import { SaleRecord } from '../types';
import { processCSVData } from '../services/dataService';

interface FileUploaderProps {
  onDataLoaded: (data: SaleRecord[]) => void;
}

const FileUploader: React.FC<FileUploaderProps> = ({ onDataLoaded }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleFile = async (file: File) => {
    setLoading(true);
    setError(null);

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const text = e.target?.result as string;
        const parsedData = await processCSVData(text);
        if (parsedData.length === 0) {
          setError("유효한 데이터가 없습니다. 파일 내용을 확인해주세요.");
        } else {
          onDataLoaded(parsedData);
        }
      } catch (err) {
        console.error(err);
        setError("파일 처리 중 오류가 발생했습니다.");
      } finally {
        setLoading(false);
      }
    };
    reader.readAsText(file);
  };

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] p-6 animate-in fade-in zoom-in duration-300">
      <div 
        className={`w-full max-w-xl p-10 border-2 border-dashed rounded-3xl text-center transition-all duration-300 ${
          isDragging 
            ? 'border-blue-500 bg-blue-50/50 scale-105 shadow-xl' 
            : 'border-slate-200 bg-white hover:border-slate-300 shadow-sm hover:shadow-md'
        }`}
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={onDrop}
      >
        <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-6">
          <Upload className="w-10 h-10 text-blue-600" strokeWidth={1.5} />
        </div>
        
        <h2 className="text-2xl font-bold text-slate-800 mb-3">매출 장부 파일 업로드</h2>
        <p className="text-slate-500 mb-8 leading-relaxed">
          가지고 계신 <strong>엑셀(CSV) 파일</strong>을 이곳에 끌어다 놓으세요.<br/>
          복잡한 형식이여도 자동으로 분석하여 대시보드로 변환합니다.
        </p>

        <label className="inline-flex">
          <input 
            type="file" 
            accept=".csv,.txt" 
            className="hidden" 
            onChange={(e) => e.target.files && handleFile(e.target.files[0])}
          />
          <span className="px-8 py-3.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-semibold cursor-pointer transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0">
            파일 선택하기
          </span>
        </label>

        {loading && (
          <div className="mt-6 flex items-center justify-center text-blue-600 font-medium">
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            데이터 분석 중...
          </div>
        )}

        {error && (
          <div className="mt-6 p-4 bg-rose-50 text-rose-600 rounded-xl flex items-center justify-center gap-2 text-sm font-medium">
            <AlertCircle size={18} />
            {error}
          </div>
        )}
      </div>

      <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-2xl w-full">
        <div className="flex flex-col items-center p-4 bg-white rounded-xl shadow-sm border border-slate-100">
          <FileText className="w-6 h-6 text-slate-400 mb-2" />
          <span className="text-xs font-semibold text-slate-600">CSV 지원</span>
        </div>
        <div className="flex flex-col items-center p-4 bg-white rounded-xl shadow-sm border border-slate-100">
          <CheckCircle className="w-6 h-6 text-emerald-500 mb-2" />
          <span className="text-xs font-semibold text-slate-600">자동 형식 인식</span>
        </div>
        <div className="flex flex-col items-center p-4 bg-white rounded-xl shadow-sm border border-slate-100">
          <CheckCircle className="w-6 h-6 text-blue-500 mb-2" />
          <span className="text-xs font-semibold text-slate-600">100% 보안 (로컬 처리)</span>
        </div>
      </div>
    </div>
  );
};

export default FileUploader;
