import React, { useState } from "react";
import { Table } from "../types";
import { TABLES } from "../data/menuData";

interface Interactive3DMapProps {
  selectedTableId: number | null;
  onSelectTable: (tableId: number) => void;
  bookedTableIds: number[];
}

export default function Interactive3DMap({
  selectedTableId,
  onSelectTable,
  bookedTableIds = []
}: Interactive3DMapProps) {
  // 3D rotation angles for custom floor view control
  const [rotateX, setRotateX] = useState<number>(55);
  const [rotateY, setRotateY] = useState<number>(0);
  const [rotateZ, setRotateZ] = useState<number>(-25);
  const [zoom, setZoom] = useState<number>(100);
  const [hoveredTable, setHoveredTable] = useState<Table | null>(null);

  // Approximate relative desk grid positions for our 3D Cafe Floor map
  const tablePositions: Record<number, { top: string; left: string; color: string; shape: "circle" | "rect" | "topchan" }> = {
    1: { top: "15%", left: "15%", color: "bg-amber-400", shape: "circle" }, // Standard small
    2: { top: "15%", left: "70%", color: "bg-amber-400", shape: "rect" },   // Booth small
    3: { top: "50%", left: "45%", color: "bg-yellow-500", shape: "circle" }, // Family central
    4: { top: "50%", left: "15%", color: "bg-yellow-500", shape: "rect" },   // Booth family
    5: { top: "80%", left: "20%", color: "bg-emerald-500", shape: "topchan" }, // VIP Topchan Big
    6: { top: "80%", left: "70%", color: "bg-emerald-500", shape: "topchan" }, // VIP Topchan Big #2
  };

  return (
    <div id="interactive-3d-map" className="bg-brand-dark/95 border border-brand-gold/20 rounded-2xl p-6 shadow-2xl relative overflow-hidden">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h3 className="font-serif text-2xl text-brand-cream flex items-center gap-2">
            <span className="text-brand-gold">🕋</span> 3D-Схема Зала Кафе
          </h3>
          <p className="text-sm text-brand-cream/60">
            Используйте слайдеры для изменения ракурса. Выберите столик для бронирования.
          </p>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap gap-4 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-brand-gold block border border-brand-cream/20"></span>
            <span className="text-brand-cream/80">Выбран</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-emerald-600 block"></span>
            <span className="text-brand-cream/80">Топчан (До 8 мест)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-red-600 block"></span>
            <span className="text-brand-cream/80">Занят</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-neutral-600 block"></span>
            <span className="text-brand-cream/80">Свободен</span>
          </div>
        </div>
      </div>

      {/* 3D Floor Playground */}
      <div className="relative h-[360px] w-full rounded-xl bg-gradient-to-b from-[#0e1613] to-[#15241e] border border-emerald-950/50 flex items-center justify-center overflow-hidden perspective-1000">
        
        {/* Sky/Atmosphere representation */}
        <div className="absolute top-0 inset-x-0 h-24 bg-gradient-to-b from-brand-emerald/20 to-transparent pointer-events-none" />

        {/* Cafe Floor Plane */}
        <div
          id="3d-floor-plane"
          className="absolute w-[500px] h-[360px] transition-all duration-300 ease-out preserve-3d"
          style={{
            transform: `rotateX(${rotateX}deg) rotateY(${rotateY}deg) rotateZ(${rotateZ}deg) scale(${zoom / 100})`,
            boxShadow: "0 50px 75px -10px rgba(0, 0, 0, 0.7)"
          }}
        >
          {/* Carpet Floor Pattern */}
          <div className="absolute inset-0 bg-[#162720] border-4 border-brand-gold/30 rounded-2xl shadow-inner relative overflow-hidden">
            {/* National Kyrgyz/Eastern Floor Grid Lines or Rugs representation */}
            <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#d4af37_1px,transparent_1px)] [background-size:24px_24px]"></div>
            
            {/* Center Area Pattern (Kiyiz/Shyrdak Rug element) */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 rounded-full border border-brand-gold/10 flex items-center justify-center">
              <div className="w-32 h-32 rounded-full border-2 border-dashed border-brand-gold/15 flex items-center justify-center">
                <span className="text-brand-gold/20 text-4xl block font-mono">BISHKEK</span>
              </div>
            </div>

            {/* Entrance indicator */}
            <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 bg-amber-500/20 px-4 py-0.5 rounded-t border-t border-x border-amber-550 border-dashed text-[10px] text-brand-gold tracking-widest text-center uppercase font-mono">
              ВХОД
            </div>

            {/* Kitchen indicator */}
            <div className="absolute top-0 left-1/3 w-24 bg-emerald-900/40 py-0.5 rounded-b border-b border-x border-emerald-800 text-[10px] text-emerald-300 tracking-widest text-center uppercase font-mono">
              КУХНЯ
            </div>

            {/* Namazkhana (Prayer room indicator) */}
            <div className="absolute top-0 right-4 w-28 bg-emerald-950/60 py-0.5 rounded-b border-b border-x border-brand-gold/20 text-[9px] text-brand-gold/80 tracking-normal text-center uppercase font-mono">
              🕌 НАМАЗХАНА
            </div>

            {/* 3D Table Elements */}
            {TABLES.map((table) => {
              const pos = tablePositions[table.id] || { top: "50%", left: "50%", color: "bg-amber-400", shape: "circle" };
              const isSelected = selectedTableId === table.id;
              const isBooked = bookedTableIds.includes(table.id);

              return (
                <div
                  key={table.id}
                  id={`table-element-${table.id}`}
                  style={{
                    position: "absolute",
                    top: pos.top,
                    left: pos.left,
                    transform: "translateZ(8px)", // lifts it on 3D plane
                  }}
                  className="group cursor-pointer select-none"
                  onClick={() => !isBooked && onSelectTable(table.id)}
                  onMouseEnter={() => setHoveredTable(table)}
                  onMouseLeave={() => setHoveredTable(null)}
                >
                  {/* Table Base & Chairs visual 3D simulation */}
                  <div className="relative flex items-center justify-center">
                    
                    {/* Simulated chairs surrounding the table */}
                    {table.capacity >= 2 && (
                      <>
                        <div className="absolute w-3 h-3 rounded-sm bg-stone-700/80 -top-4 transition-transform group-hover:scale-110" style={{ transform: "translateZ(-4px)" }} />
                        <div className="absolute w-3 h-3 rounded-sm bg-stone-700/80 -bottom-4 transition-transform group-hover:scale-110" style={{ transform: "translateZ(-4px)" }} />
                      </>
                    )}
                    {table.capacity >= 4 && (
                      <>
                        <div className="absolute w-3 h-3 rounded-sm bg-stone-700/80 -left-4 transition-transform group-hover:scale-110" style={{ transform: "translateZ(-4px)" }} />
                        <div className="absolute w-3 h-3 rounded-sm bg-stone-700/80 -right-4 transition-transform group-hover:scale-110" style={{ transform: "translateZ(-4px)" }} />
                      </>
                    )}

                    {/* Table Surface */}
                    <div
                      id={`surface-table-${table.id}`}
                      style={{ transform: "translateZ(10px)" }}
                      className={`
                        shadow-lg transition-all duration-200 flex flex-col items-center justify-center font-mono text-xs font-bold border
                        ${pos.shape === "circle" ? "rounded-full w-12 h-12" : ""}
                        ${pos.shape === "rect" ? "rounded-md w-14 h-10" : ""}
                        ${pos.shape === "topchan" ? "rounded-lg w-16 h-12 border-dotted border-brand-gold bg-amber-950/70 p-1" : ""}
                        ${isSelected ? "bg-brand-gold text-brand-dark border-brand-cream ring-2 ring-brand-cream/40" : ""}
                        ${isBooked ? "bg-red-800 text-brand-cream border-red-500 cursor-not-allowed opacity-80" : ""}
                        ${!isSelected && !isBooked ? "bg-[#1f372d] text-brand-cream hover:bg-[#28483b] border-brand-emerald-light" : ""}
                      `}
                    >
                      {/* Table Identifier */}
                      <span>№{table.id}</span>
                      
                      {/* Subtitle / Seats */}
                      <span className="text-[8px] opacity-70">
                        {pos.shape === "topchan" ? "ТОПЧАН" : `${table.capacity}м`}
                      </span>

                      {/* Small visual items (teapot/plate) */}
                      {pos.shape === "topchan" && (
                        <div className="absolute bottom-0.5 right-0.5 w-1.5 h-1.5 rounded-full bg-amber-200/40" />
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Tooltip Overlay */}
        {hoveredTable && (
          <div id="table-tooltip" className="absolute top-4 left-4 right-4 md:right-auto md:w-80 bg-brand-dark/95 border border-brand-gold/30 rounded-xl p-3 shadow-xl backdrop-blur-sm z-10 animate-fade-in">
            <div className="flex items-center justify-between mb-1">
              <h4 className="font-serif text-brand-cream font-bold">{hoveredTable.name}</h4>
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-semibold ${
                bookedTableIds.includes(hoveredTable.id) ? "bg-red-950 text-red-400 border border-red-800" : "bg-emerald-950 text-emerald-400 border border-emerald-800"
              }`}>
                {bookedTableIds.includes(hoveredTable.id) ? "ЗАНЯТ" : "СВОБОДЕН"}
              </span>
            </div>
            <p className="text-xs text-brand-cream/70 mb-1.5">{hoveredTable.description}</p>
            <div className="flex items-center justify-between text-[11px] font-mono border-t border-brand-cream/10 pt-1.5">
              <span className="text-brand-cream/50">Вместимость:</span>
              <span className="text-brand-gold font-bold">{hoveredTable.capacity} человек</span>
            </div>
          </div>
        )}
      </div>

      {/* Camera Adjuster Sliders for dynamic 3D interaction */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-5 bg-black/40 p-4 rounded-xl border border-brand-gold/10">
        <div>
          <label className="text-[11px] text-brand-cream/60 block mb-1 font-mono uppercase tracking-wider">
            Наклон X: {rotateX}°
          </label>
          <input
            type="range"
            min="15"
            max="80"
            value={rotateX}
            onChange={(e) => setRotateX(Number(e.target.value))}
            className="w-full h-1 bg-emerald-950 rounded-lg appearance-none cursor-pointer accent-brand-gold"
          />
        </div>
        <div>
          <label className="text-[11px] text-brand-cream/60 block mb-1 font-mono uppercase tracking-wider">
            Поворот Z: {rotateZ}°
          </label>
          <input
            type="range"
            min="-180"
            max="180"
            value={rotateZ}
            onChange={(e) => setRotateZ(Number(e.target.value))}
            className="w-full h-1 bg-emerald-950 rounded-lg appearance-none cursor-pointer accent-brand-gold"
          />
        </div>
        <div>
          <label className="text-[11px] text-brand-cream/60 block mb-1 font-mono uppercase tracking-wider">
            Масштаб: {zoom}%
          </label>
          <input
            type="range"
            min="60"
            max="140"
            value={zoom}
            onChange={(e) => setZoom(Number(e.target.value))}
            className="w-full h-1 bg-emerald-950 rounded-lg appearance-none cursor-pointer accent-brand-gold"
          />
        </div>
        <div className="flex items-end">
          <button
            onClick={() => {
              setRotateX(55);
              setRotateY(0);
              setRotateZ(-25);
              setZoom(100);
            }}
            id="reset-3d-button"
            className="w-full bg-brand-emerald hover:bg-brand-emerald-light text-brand-cream border border-brand-gold/20 py-1.5 px-3 rounded text-xs transition duration-200 font-mono"
          >
            СБРОСИТЬ КАМЕРУ
          </button>
        </div>
      </div>
    </div>
  );
}
