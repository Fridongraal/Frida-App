import React, { useState, useEffect, useMemo } from 'react';
import { X, UploadCloud, FileText, CheckCircle2, AlertCircle, RefreshCw, Check } from 'lucide-react';
import { parseCSVToRawRows, mapRowsToCards } from '../utils/csvParser';

export default function CSVImporter({
  subjects,
  decks,
  initialDeckId,
  onImport, // (subjectId, deckId, cards) => Promise<void> or void
  onClose
}) {
  // Encontrar el mazo inicial y su materia si se pasa initialDeckId
  const initialDeck = useMemo(() => decks.find(d => d.id === initialDeckId), [decks, initialDeckId]);
  const initialSubjectId = initialDeck?.subjectId || subjects[0]?.id || '';

  // Estados de Destino
  const [selectedSubjectId, setSelectedSubjectId] = useState(initialSubjectId);
  const [selectedDeckId, setSelectedDeckId] = useState(initialDeckId || '');

  // Filtrar los mazos disponibles para la materia seleccionada
  const filteredDecks = useMemo(() => {
    return decks.filter(deck => deck.subjectId === selectedSubjectId);
  }, [decks, selectedSubjectId]);

  // Si cambia la materia, preseleccionar el primer mazo de esa materia
  useEffect(() => {
    if (filteredDecks.length > 0) {
      // Evitar resetear si ya coincide con el mazo inicial
      const deckExists = filteredDecks.some(d => d.id === selectedDeckId);
      if (!deckExists) {
        setSelectedDeckId(filteredDecks[0].id);
      }
    } else {
      setSelectedDeckId('');
    }
  }, [filteredDecks, selectedSubjectId]);

  // Estados del Archivo
  const [step, setStep] = useState(1); // 1: Carga, 2: Mapeo, 3: Procesando / Éxito
  const [file, setFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [rawRows, setRawRows] = useState([]);
  const [errorMsg, setErrorMsg] = useState('');

  // Estados de Mapeo
  const [hasHeaders, setHasHeaders] = useState(true);
  const [frontColIndex, setFrontColIndex] = useState(0);
  const [backColIndex, setBackColIndex] = useState(1);
  const [importing, setImporting] = useState(false);

  // Cabeceras estimadas o índices
  const headers = useMemo(() => {
    if (rawRows.length === 0) return [];
    if (hasHeaders) {
      return rawRows[0].map((cell, idx) => cell.trim() || `Columna ${idx + 1}`);
    } else {
      return rawRows[0].map((_, idx) => `Columna ${idx + 1}`);
    }
  }, [rawRows, hasHeaders]);

  // Tarjetas mapeadas resultantes (Vista previa)
  const mappedCards = useMemo(() => {
    if (rawRows.length === 0) return [];
    return mapRowsToCards(rawRows, { frontColIndex, backColIndex, hasHeaders });
  }, [rawRows, frontColIndex, backColIndex, hasHeaders]);

  // Procesar archivo
  const processFile = async (uploadedFile) => {
    if (!uploadedFile) return;
    if (!uploadedFile.name.endsWith('.csv')) {
      setErrorMsg('Por favor, selecciona un archivo con formato .csv');
      return;
    }

    try {
      setErrorMsg('');
      setFile(uploadedFile);
      const rows = await parseCSVToRawRows(uploadedFile);
      setRawRows(rows);

      // Pre-seleccionar columnas razonables (Frente = 0, Reverso = 1 si existen)
      if (rows[0]) {
        setFrontColIndex(0);
        setBackColIndex(rows[0].length > 1 ? 1 : 0);
      }

      setStep(2);
    } catch (err) {
      console.error(err);
      setErrorMsg(err.message || 'Error al procesar el archivo CSV.');
    }
  };

  // Handlers de Drag & Drop
  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFile = e.dataTransfer.files[0];
    processFile(droppedFile);
  };

  const handleFileSelect = (e) => {
    const selectedFile = e.target.files[0];
    processFile(selectedFile);
  };

  const executeImport = async () => {
    if (mappedCards.length === 0 || !selectedDeckId || !selectedSubjectId) return;

    setImporting(true);
    try {
      // Simular una pequeña pausa para la barra de progreso
      await new Promise(resolve => setTimeout(resolve, 800));
      await onImport(selectedSubjectId, selectedDeckId, mappedCards);
      setStep(3);
    } catch (err) {
      console.error(err);
      setErrorMsg('Error al importar las tarjetas.');
    } finally {
      setImporting(false);
    }
  };

  const currentDeckName = decks.find(d => d.id === selectedDeckId)?.name || 'Mazo seleccionado';

  return (
    <div className="fixed inset-0 bg-light-bg/40 dark:bg-black/65 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in text-light-text dark:text-dark-text">
      <div className="bg-light-card dark:bg-dark-card rounded-3xl border border-frida-primary/15 dark:border-dark-muted p-6 w-full max-w-2xl shadow-2xl relative animate-slide-up flex flex-col max-h-[90vh] overflow-hidden transition-colors duration-300">
        
        {/* Cabecera del modal */}
        <div className="flex items-start justify-between border-b border-frida-primary/10 dark:border-dark-muted/40 pb-4 mb-4">
          <div>
            <h3 className="text-xl font-bold text-light-text dark:text-dark-text flex items-center gap-2">
              <UploadCloud size={22} className="text-frida-primary" />
              <span>Importar Tarjetas desde CSV</span>
            </h3>
            <p className="text-xs text-warmgray-455 mt-1">
              Agrega múltiples tarjetas de forma masiva asignando columnas de un archivo CSV.
            </p>
          </div>
          <button
            onClick={onClose}
            disabled={importing}
            className="p-2 text-warmgray-450 dark:text-warmgray-500 hover:text-light-text dark:hover:text-white hover:bg-frida-secondary/20 dark:hover:bg-dark-muted/20 rounded-xl transition-all"
          >
            <X size={18} />
          </button>
        </div>

        {/* Contenido en Scroll */}
        <div className="flex-1 overflow-y-auto pr-1 flex flex-col gap-6">

          {/* STEP 1: SUBIDA DE ARCHIVO */}
          {step === 1 && (
            <div className="flex flex-col gap-4">
              {/* Selectores de Destino */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-frida-secondary/10 dark:bg-frida-primary/5 p-4 border border-frida-primary/15 dark:border-dark-muted/40 rounded-2xl">
                <div>
                  <label className="block text-xs font-bold text-frida-primary dark:text-frida-secondary uppercase tracking-wider mb-1.5">
                    Materia Destino
                  </label>
                  <select
                    value={selectedSubjectId}
                    onChange={(e) => setSelectedSubjectId(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-light-bg dark:bg-dark-bg/40 border border-frida-primary/20 dark:border-dark-muted focus:border-frida-primary focus:outline-none text-sm text-light-text dark:text-dark-text transition-all"
                  >
                    {subjects.map(subject => (
                      <option key={subject.id} value={subject.id}>{subject.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-frida-primary dark:text-frida-secondary uppercase tracking-wider mb-1.5">
                    Mazo Destino
                  </label>
                  <select
                    value={selectedDeckId}
                    onChange={(e) => setSelectedDeckId(e.target.value)}
                    disabled={filteredDecks.length === 0}
                    className="w-full px-3 py-2.5 rounded-xl bg-light-bg dark:bg-dark-bg/40 border border-frida-primary/20 dark:border-dark-muted focus:border-frida-primary focus:outline-none text-sm text-light-text dark:text-dark-text transition-all disabled:opacity-50"
                  >
                    {filteredDecks.map(deck => (
                      <option key={deck.id} value={deck.id}>{deck.name}</option>
                    ))}
                    {filteredDecks.length === 0 && (
                      <option value="">No hay mazos en esta materia</option>
                    )}
                  </select>
                </div>
              </div>

              {/* Zona Drag & Drop */}
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`flex flex-col items-center justify-center p-10 border-2 border-dashed rounded-3xl text-center cursor-pointer transition-all duration-300 ${
                  isDragging
                    ? 'border-frida-primary bg-frida-secondary/20 scale-[1.01]'
                    : 'border-frida-primary/20 dark:border-dark-muted/40 hover:border-frida-primary/40 hover:bg-frida-secondary/10 dark:hover:bg-dark-muted/20'
                }`}
                onClick={() => document.getElementById('csv-file-input').click()}
              >
                <input
                  id="csv-file-input"
                  type="file"
                  accept=".csv"
                  onChange={handleFileSelect}
                  className="hidden"
                />
                <div className="w-14 h-14 bg-frida-secondary/20 dark:bg-dark-muted/20 rounded-2xl flex items-center justify-center text-frida-primary mb-4">
                  <UploadCloud size={30} />
                </div>
                <h4 className="text-base font-bold text-light-text dark:text-dark-text">
                  Arrastra tu archivo CSV aquí
                </h4>
                <p className="text-xs text-warmgray-455 mt-1.5 max-w-xs">
                  O haz clic para explorar tus archivos locales. Asegúrate de que use coma, punto y coma o tabulador como delimitador.
                </p>
              </div>

              {errorMsg && (
                <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-950/20 border border-red-100 dark:border-red-950/50 rounded-xl text-xs font-semibold text-red-650 dark:text-red-400 animate-fade-in">
                  <AlertCircle size={16} />
                  <span>{errorMsg}</span>
                </div>
              )}
            </div>
          )}

          {/* STEP 2: MAPEO DE COLUMNAS Y VISTA PREVIA */}
          {step === 2 && (
            <div className="flex flex-col gap-5 animate-fade-in">
              <div className="flex items-center justify-between bg-frida-secondary/15 dark:bg-dark-muted/10 p-3.5 border border-frida-primary/20 dark:border-dark-muted rounded-xl">
                <div className="flex items-center gap-2">
                  <FileText size={18} className="text-frida-primary" />
                  <span className="text-xs font-bold truncate max-w-[200px]" title={file?.name}>{file?.name}</span>
                  <span className="text-[10px] text-warmgray-450">({(file?.size / 1024).toFixed(1)} KB)</span>
                </div>
                <button
                  onClick={() => { setStep(1); setFile(null); setRawRows([]); }}
                  className="text-xs text-frida-primary hover:underline dark:text-frida-secondary font-semibold"
                >
                  Cambiar archivo
                </button>
              </div>

              {/* Opciones de Mapeo */}
              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="csv-has-headers"
                    checked={hasHeaders}
                    onChange={(e) => setHasHeaders(e.target.checked)}
                    className="w-4 h-4 text-frida-primary focus:ring-frida-primary border-frida-primary/20 rounded"
                  />
                  <label htmlFor="csv-has-headers" className="text-xs font-semibold text-light-text dark:text-dark-text/80 cursor-pointer">
                    La primera fila contiene cabeceras de columnas
                  </label>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-frida-primary dark:text-frida-secondary uppercase tracking-wider mb-1.5">
                      Frente (Pregunta / Concepto)
                    </label>
                    <select
                      value={frontColIndex}
                      onChange={(e) => setFrontColIndex(Number(e.target.value))}
                      className="w-full px-3 py-2.5 rounded-xl bg-light-bg dark:bg-dark-bg/40 border border-frida-primary/20 dark:border-dark-muted focus:border-frida-primary focus:outline-none text-sm text-light-text dark:text-dark-text"
                    >
                      {headers.map((header, idx) => (
                        <option key={idx} value={idx}>{header}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-frida-primary dark:text-frida-secondary uppercase tracking-wider mb-1.5">
                      Reverso (Respuesta / Definición)
                    </label>
                    <select
                      value={backColIndex}
                      onChange={(e) => setBackColIndex(Number(e.target.value))}
                      className="w-full px-3 py-2.5 rounded-xl bg-light-bg dark:bg-dark-bg/40 border border-frida-primary/20 dark:border-dark-muted focus:border-frida-primary focus:outline-none text-sm text-light-text dark:text-dark-text"
                    >
                      {headers.map((header, idx) => (
                        <option key={idx} value={idx}>{header}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Vista Previa de Tarjetas */}
              <div className="flex flex-col gap-2.5">
                <span className="text-xs font-bold text-frida-primary dark:text-frida-secondary uppercase tracking-wider">
                  Vista Previa de Tarjetas (Primeras 3 filas válidas)
                </span>
                
                {mappedCards.length === 0 ? (
                  <div className="p-6 border border-dashed border-red-200 bg-red-50/10 rounded-2xl text-center text-xs text-red-500">
                    No se pueden mapear tarjetas con la configuración actual. Revisa los selectores.
                  </div>
                ) : (
                  <div className="flex flex-col gap-2">
                    {mappedCards.slice(0, 3).map((card, idx) => (
                      <div
                        key={idx}
                        className="bg-light-bg dark:bg-dark-bg/30 border border-frida-primary/15 dark:border-dark-muted/40 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-start justify-between gap-3 text-xs"
                      >
                        <div className="flex-1">
                          <span className="font-bold text-frida-primary uppercase tracking-wider text-[10px] block mb-1">
                            Anverso (Frente)
                          </span>
                          <p className="font-semibold text-light-text dark:text-dark-text line-clamp-3">
                            {card.front}
                          </p>
                        </div>
                        <div className="w-px self-stretch bg-frida-primary/15 dark:bg-dark-muted/25 hidden sm:block"></div>
                        <div className="flex-1">
                          <span className="font-bold text-frida-primary uppercase tracking-wider text-[10px] block mb-1">
                            Reverso
                          </span>
                          <p className="text-warmgray-455 dark:text-warmgray-400 line-clamp-3">
                            {card.back}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Resumen del Mapeo */}
              <div className="flex items-center gap-2.5 p-4 bg-green-50/40 dark:bg-green-950/10 border border-green-150 dark:border-green-950/50 rounded-2xl text-xs font-semibold text-green-750 dark:text-green-400">
                <CheckCircle2 size={18} className="text-green-500" />
                <span>
                  Se detectaron <strong>{mappedCards.length}</strong> tarjetas válidas listas para importar en el mazo: <strong>{currentDeckName}</strong>.
                </span>
              </div>
            </div>
          )}

          {/* STEP 3: ÉXITO */}
          {step === 3 && (
            <div className="flex flex-col items-center justify-center p-8 text-center animate-fade-in gap-5">
              <div className="w-16 h-16 bg-green-50 dark:bg-green-950/30 text-green-500 dark:text-green-400 rounded-3xl flex items-center justify-center shadow-sm">
                <Check size={32} strokeWidth={3} />
              </div>
              <div>
                <h3 className="text-2xl font-extrabold text-light-text dark:text-dark-text">
                  ¡Importación Completada!
                </h3>
                <p className="text-sm text-warmgray-450 mt-1 max-w-sm mx-auto">
                  Se han añadido con éxito <strong>{mappedCards.length}</strong> tarjetas al mazo <strong>{currentDeckName}</strong>.
                </p>
              </div>
              <button
                onClick={onClose}
                className="mt-2 px-6 py-3 bg-frida-primary hover:bg-frida-primary/95 text-light-text font-extrabold rounded-2xl transition-colors shadow-sm shadow-frida-secondary/25 text-sm"
              >
                Listo
              </button>
            </div>
          )}

        </div>

        {/* Footer del Modal (Botones de acción) */}
        {step < 3 && (
          <div className="flex items-center justify-end gap-3 border-t border-frida-primary/10 dark:border-dark-muted/40 pt-4 mt-4">
            <button
              onClick={onClose}
              disabled={importing}
              className="px-4 py-2.5 text-sm font-semibold text-warmgray-455 dark:text-warmgray-500 hover:bg-warmgray-100 dark:hover:bg-dark-muted/20 rounded-xl transition-colors disabled:opacity-50"
            >
              Cancelar
            </button>
            
            {step === 2 && (
              <button
                onClick={executeImport}
                disabled={importing || mappedCards.length === 0}
                className="flex items-center justify-center gap-2 px-6 py-2.5 bg-frida-primary hover:bg-frida-primary/95 disabled:bg-warmgray-100 disabled:text-warmgray-400 dark:disabled:bg-lavender-950/15 dark:disabled:text-warmgray-600 text-light-text font-extrabold rounded-xl text-sm transition-all shadow-sm active:scale-[0.98] shadow-frida-secondary/20"
              >
                {importing ? (
                  <>
                    <RefreshCw size={16} className="animate-spin" />
                    <span>Importando...</span>
                  </>
                ) : (
                  <span>Importar tarjetas</span>
                )}
              </button>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
