import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  FolderOpen,
  UploadCloud,
  FileAudio,
  CheckCircle2,
  AlertTriangle,
  Copy,
  FileCheck,
  RefreshCw,
  Sparkles,
  ArrowRight,
  HardDrive,
  FolderPlus,
  Music
} from 'lucide-react';
import { adminAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

export default function ImportProgressModal({ isOpen, onClose, onReviewRequested, onSuccess }) {
  const { user, isAdmin, quickLoginAdmin } = useAuth();

  const [mode, setMode] = useState('upload'); // 'upload' | 'folder_scan'
  const [folderPath, setFolderPath] = useState('storage/music/demo');
  const [isScanning, setIsScanning] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [progress, setProgress] = useState(null);
  const [error, setError] = useState(null);
  const [uploadResult, setUploadResult] = useState(null);
  const [isDragging, setIsDragging] = useState(false);

  const fileInputRef = useRef(null);
  const folderInputRef = useRef(null);

  // Auto-login as admin if not already logged in when opening modal
  useEffect(() => {
    if (isOpen && !isAdmin) {
      quickLoginAdmin().catch(console.error);
    }
  }, [isOpen, isAdmin]);

  // Poll status while scanning
  useEffect(() => {
    let interval;
    if (isScanning) {
      interval = setInterval(async () => {
        try {
          const res = await adminAPI.getScanStatus();
          const p = res.data.progress;
          setProgress(p);
          if (!p.isRunning && (p.status === 'completed' || p.status === 'error')) {
            setIsScanning(false);
            if (onSuccess) onSuccess();
          }
        } catch (err) {
          console.error(err);
        }
      }, 800);
    }
    return () => clearInterval(interval);
  }, [isScanning, onSuccess]);

  if (!isOpen) return null;

  // Handle direct file uploads (Drag & Drop or File Input)
  const handleFilesUpload = async (files) => {
    if (!files || files.length === 0) return;

    setError(null);
    setIsUploading(true);
    setUploadProgress(10);
    setUploadResult(null);

    const formData = new FormData();
    let count = 0;
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const ext = file.name.split('.').pop().toLowerCase();
      if (['mp3', 'wav', 'flac', 'm4a', 'aac', 'ogg', 'opus', 'wma'].includes(ext)) {
        formData.append('audioFiles', file);
        count++;
      }
    }

    if (count === 0) {
      setError('No supported audio files found (.mp3, .wav, .flac, .m4a, .aac, .ogg)');
      setIsUploading(false);
      return;
    }

    setUploadProgress(40);

    try {
      if (!isAdmin) {
        await quickLoginAdmin();
      }
      const res = await adminAPI.uploadFiles(formData);
      setUploadProgress(100);
      setUploadResult(res.data);
      if (onSuccess) onSuccess();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to upload audio files');
    } finally {
      setIsUploading(false);
    }
  };

  // Handle Local Folder Path Scanner
  const handleStartScan = async (e) => {
    e.preventDefault();
    if (!folderPath.trim()) return;

    setError(null);
    setIsScanning(true);
    setProgress({
      isRunning: true,
      percentage: 0,
      totalFilesFound: 0,
      scanned: 0,
      imported: 0,
      duplicates: 0,
      missingMetadata: 0,
      errors: 0,
      status: 'scanning'
    });

    try {
      if (!isAdmin) {
        await quickLoginAdmin();
      }
      await adminAPI.startScan(folderPath.trim());
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to start folder scan');
      setIsScanning(false);
    }
  };

  // Drag and drop handlers
  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      handleFilesUpload(files);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in overflow-y-auto">
      <div className="glass-panel w-full max-w-xl rounded-3xl p-6 sm:p-8 shadow-2xl border border-white/15 my-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-brand-500/10 text-brand-400 border border-brand-500/20 shadow-glow-brand">
              <HardDrive className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Import / Upload Local Music</h3>
              <p className="text-xs text-slate-400">Add songs from your computer to Sonora</p>
            </div>
          </div>
          {!isScanning && !isUploading && (
            <button onClick={onClose} className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-white/5">
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Mode Switcher Tabs */}
        {!isScanning && !isUploading && !uploadResult && (!progress || !progress.isRunning) && (
          <div className="grid grid-cols-2 gap-2 p-1.5 rounded-2xl bg-dark-900 border border-white/10 mb-5">
            <button
              onClick={() => setMode('upload')}
              className={`flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition ${
                mode === 'upload'
                  ? 'bg-brand-500 text-white shadow-glow-brand'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <UploadCloud className="w-4 h-4" />
              Browse & Drag Files / Folder
            </button>
            <button
              onClick={() => setMode('folder_scan')}
              className={`flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition ${
                mode === 'folder_scan'
                  ? 'bg-cyan-500 text-white shadow-glow-cyan'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <FolderOpen className="w-4 h-4" />
              Scan Disk Folder Path
            </button>
          </div>
        )}

        {error && (
          <div className="p-3 mb-4 rounded-xl bg-red-500/10 border border-red-500/20 text-xs text-red-300">
            {error}
          </div>
        )}

        {/* MODE 1: DRAG & DROP / FILE / FOLDER BROWSER UPLOAD */}
        {mode === 'upload' && !isScanning && !isUploading && !uploadResult && (
          <div className="space-y-4">
            {/* Drag and Drop Zone */}
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-3xl p-8 text-center transition-all cursor-pointer ${
                isDragging
                  ? 'border-brand-400 bg-brand-500/20 scale-[1.02]'
                  : 'border-white/15 hover:border-brand-500/40 bg-dark-900/60 hover:bg-dark-900'
              }`}
              onClick={() => fileInputRef.current?.click()}
            >
              <div className="w-16 h-16 rounded-2xl bg-brand-500/15 text-brand-400 border border-brand-500/20 flex items-center justify-center mx-auto mb-3 shadow-glow-brand">
                <UploadCloud className="w-8 h-8 animate-bounce" />
              </div>
              <h4 className="text-base font-bold text-white mb-1">
                Drag & Drop Audio Files or Folders Here
              </h4>
              <p className="text-xs text-slate-400 max-w-sm mx-auto mb-4">
                Supports MP3, WAV, FLAC, M4A, AAC, OGG. Tags & album art are extracted automatically.
              </p>

              <div className="flex flex-wrap items-center justify-center gap-3" onClick={(e) => e.stopPropagation()}>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-4 py-2 rounded-xl bg-brand-500 text-white font-bold text-xs shadow-glow-brand hover:scale-105 transition flex items-center gap-2"
                >
                  <FileAudio className="w-3.5 h-3.5" />
                  Select Audio Files
                </button>

                <button
                  type="button"
                  onClick={() => folderInputRef.current?.click()}
                  className="px-4 py-2 rounded-xl bg-white/10 border border-white/15 text-white font-semibold text-xs hover:bg-white/20 transition flex items-center gap-2"
                >
                  <FolderPlus className="w-3.5 h-3.5 text-cyan-400" />
                  Select Entire Folder
                </button>
              </div>

              {/* Hidden File Inputs */}
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept=".mp3,.wav,.flac,.m4a,.aac,.ogg,.opus,.wma,audio/*"
                className="hidden"
                onChange={(e) => handleFilesUpload(e.target.files)}
              />
              <input
                ref={folderInputRef}
                type="file"
                webkitdirectory="true"
                directory="true"
                multiple
                className="hidden"
                onChange={(e) => handleFilesUpload(e.target.files)}
              />
            </div>
          </div>
        )}

        {/* UPLOADING STATE ANIMATION */}
        {isUploading && (
          <div className="py-8 text-center space-y-4 animate-in fade-in">
            <div className="w-16 h-16 rounded-full border-4 border-brand-500 border-t-transparent animate-spin mx-auto" />
            <div>
              <h4 className="text-base font-bold text-white">Uploading & Parsing Audio Tags...</h4>
              <p className="text-xs text-slate-400 mt-1">Reading ID3 tags, artwork pictures, and indexing into library</p>
            </div>
            <div className="w-full max-w-xs mx-auto h-2 bg-dark-900 rounded-full overflow-hidden border border-white/10">
              <div
                className="h-full bg-gradient-to-r from-brand-500 to-cyan-400 rounded-full transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          </div>
        )}

        {/* UPLOAD RESULT SUMMARY */}
        {uploadResult && (
          <div className="space-y-6 animate-in fade-in">
            <div className="text-center">
              <div className="w-14 h-14 rounded-2xl bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center justify-center mx-auto mb-2 shadow-glow-emerald">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <h4 className="text-lg font-bold text-white">{uploadResult.message}</h4>
              <p className="text-xs text-slate-400">All songs have been parsed and organized into artists, albums, and genres.</p>
            </div>

            {/* Metrics Counters */}
            <div className="grid grid-cols-3 gap-3">
              <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-center">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 mx-auto mb-1" />
                <span className="text-lg font-bold text-emerald-300 block">{uploadResult.imported || 0}</span>
                <span className="text-[10px] text-emerald-400 uppercase tracking-wider">Imported</span>
              </div>
              <div className="p-3 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-center">
                <Copy className="w-4 h-4 text-blue-400 mx-auto mb-1" />
                <span className="text-lg font-bold text-blue-300 block">{uploadResult.duplicates || 0}</span>
                <span className="text-[10px] text-blue-400 uppercase tracking-wider">Duplicates</span>
              </div>
              <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-center">
                <AlertTriangle className="w-4 h-4 text-amber-400 mx-auto mb-1" />
                <span className="text-lg font-bold text-amber-300 block">{uploadResult.missingMetadata || 0}</span>
                <span className="text-[10px] text-amber-400 uppercase tracking-wider">Needs Review</span>
              </div>
            </div>

            <div className="pt-2 flex justify-end gap-3 border-t border-white/10">
              <button
                type="button"
                onClick={() => {
                  setUploadResult(null);
                }}
                className="px-4 py-2 text-xs font-semibold text-slate-300 hover:bg-white/5 rounded-xl transition"
              >
                Upload More
              </button>
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2.5 text-xs font-bold text-white bg-brand-500 rounded-xl shadow-glow-brand transition"
              >
                Done & Listen Now
              </button>
            </div>
          </div>
        )}

        {/* MODE 2: LOCAL DISK FOLDER PATH SCANNER */}
        {mode === 'folder_scan' && !progress?.isRunning && progress?.status !== 'completed' && !uploadResult && (
          <form onSubmit={handleStartScan} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5 flex items-center justify-between">
                <span>Folder Path on Local Drive</span>
                <span className="text-[11px] text-brand-400">Recursive Subfolders Included</span>
              </label>
              <div className="relative">
                <FolderOpen className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  placeholder="e.g. C:\Music or D:\Songs or storage/music/demo"
                  value={folderPath}
                  onChange={(e) => setFolderPath(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-dark-900 border border-white/10 rounded-xl text-sm text-white font-mono placeholder-slate-500 focus:outline-none focus:border-brand-500"
                />
              </div>
            </div>

            {/* Quick folder presets */}
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setFolderPath('storage/music/demo')}
                className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs text-slate-300 hover:bg-white/10 transition flex items-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5 text-brand-400" />
                Default Demo Audio Pack
              </button>
            </div>

            <div className="pt-2 flex justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 text-xs font-bold text-white bg-cyan-500 text-dark-950 font-black rounded-xl shadow-glow-cyan hover:scale-105 transition flex items-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                Start Scanner
              </button>
            </div>
          </form>
        )}

        {/* Live Folder Scanner Progress Bar & Stats */}
        {mode === 'folder_scan' && (progress?.isRunning || progress?.status === 'completed') && (
          <div className="space-y-6 animate-in fade-in">
            <div>
              <div className="flex items-center justify-between text-xs font-semibold mb-2">
                <span className="text-slate-300 flex items-center gap-2">
                  {progress.isRunning && <RefreshCw className="w-3.5 h-3.5 animate-spin text-brand-400" />}
                  {progress.isRunning ? 'Scanning & Indexing Audio Tags...' : 'Scan Complete!'}
                </span>
                <span className="text-brand-400 font-mono text-sm">{progress.percentage || 0}%</span>
              </div>
              <div className="w-full h-3 bg-dark-900 rounded-full overflow-hidden border border-white/10 p-0.5">
                <div
                  className="h-full bg-gradient-to-r from-brand-500 via-brand-accent to-brand-emerald rounded-full transition-all duration-300 shadow-glow-brand"
                  style={{ width: `${progress.percentage || 0}%` }}
                />
              </div>
            </div>

            {/* Metrics Counters Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3 rounded-2xl bg-white/5 border border-white/5 text-center">
                <FileCheck className="w-4 h-4 text-slate-400 mx-auto mb-1" />
                <span className="text-base font-bold text-white block">{progress.scanned || 0}</span>
                <span className="text-[10px] text-slate-400 uppercase tracking-wider">Scanned</span>
              </div>

              <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-center">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 mx-auto mb-1" />
                <span className="text-base font-bold text-emerald-300 block">{progress.imported || 0}</span>
                <span className="text-[10px] text-emerald-400 uppercase tracking-wider">Imported</span>
              </div>

              <div className="p-3 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-center">
                <Copy className="w-4 h-4 text-blue-400 mx-auto mb-1" />
                <span className="text-base font-bold text-blue-300 block">{progress.duplicates || 0}</span>
                <span className="text-[10px] text-blue-400 uppercase tracking-wider">Duplicates</span>
              </div>

              <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-center">
                <AlertTriangle className="w-4 h-4 text-amber-400 mx-auto mb-1" />
                <span className="text-base font-bold text-amber-300 block">{progress.missingMetadata || 0}</span>
                <span className="text-[10px] text-amber-400 uppercase tracking-wider">Needs Review</span>
              </div>
            </div>

            {/* Completion Actions */}
            {progress.status === 'completed' && (
              <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={onClose}
                  className="w-full sm:w-auto px-4 py-2.5 text-xs font-semibold text-slate-300 hover:bg-white/5 rounded-xl transition"
                >
                  Done
                </button>

                {progress.missingMetadata > 0 ? (
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      if (onReviewRequested) onReviewRequested();
                    }}
                    className="w-full sm:w-auto px-5 py-2.5 text-xs font-bold text-white bg-amber-500 hover:bg-amber-600 rounded-xl shadow-glow-amber transition flex items-center justify-center gap-2"
                  >
                    Review Missing Metadata ({progress.missingMetadata})
                    <ArrowRight className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={onClose}
                    className="w-full sm:w-auto px-5 py-2.5 text-xs font-bold text-white bg-brand-500 rounded-xl shadow-glow-brand transition"
                  >
                    Explore Library
                  </button>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
