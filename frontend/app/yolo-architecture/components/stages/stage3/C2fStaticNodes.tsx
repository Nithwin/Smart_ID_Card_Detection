export function C2fStaticNodes() {
  return (
    <>
      {/* Split Node */}
      <div className="absolute top-[50%] left-[20%] w-[50px] h-[80px] -translate-x-1/2 -translate-y-1/2 bg-slate-800/80 backdrop-blur border border-slate-600 rounded flex items-center justify-center shadow-[0_0_20px_black] z-10">
        <span className="text-[9px] font-mono font-bold text-slate-400 rotate-[-90deg]">Split(2)</span>
      </div>

      {/* Gradient Highway Label */}
      <div className="absolute top-[10%] left-[50%] -translate-x-1/2 px-4 py-1 bg-blue-900/40 border border-blue-500/40 rounded shadow-lg z-10 flex items-center gap-2">
        <div className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
        <span className="text-[10px] font-mono font-bold text-blue-300">Identity / Gradient Highway</span>
      </div>

      {/* Bottleneck 1 Node */}
      <div className="absolute top-[75%] left-[40%] w-[70px] h-[60px] -translate-x-1/2 -translate-y-1/2 bg-slate-800/80 backdrop-blur border border-purple-500/50 rounded flex flex-col items-center justify-center shadow-[0_0_20px_rgba(168,85,247,0.3)] z-10">
        <span className="text-[9px] font-mono font-bold text-purple-300 mb-1">Bottleneck 1</span>
        <div className="w-12 h-6 bg-purple-600/30 border border-purple-500 rounded flex items-center justify-center">
          <span className="text-[7px] font-mono text-purple-100">Conv+BN</span>
        </div>
      </div>

      {/* Bottleneck 2 Node */}
      <div className="absolute top-[75%] left-[60%] w-[70px] h-[60px] -translate-x-1/2 -translate-y-1/2 bg-slate-800/80 backdrop-blur border border-fuchsia-500/50 rounded flex flex-col items-center justify-center shadow-[0_0_20px_rgba(217,70,239,0.3)] z-10">
        <span className="text-[9px] font-mono font-bold text-fuchsia-300 mb-1">Bottleneck 2</span>
        <div className="w-12 h-6 bg-fuchsia-600/30 border border-fuchsia-500 rounded flex items-center justify-center">
          <span className="text-[7px] font-mono text-fuchsia-100">Conv+BN</span>
        </div>
      </div>

      {/* Concat Node */}
      <div className="absolute top-[50%] left-[80%] w-[50px] h-[160px] -translate-x-1/2 -translate-y-1/2 bg-slate-900 border-2 border-dashed border-[#d946ef]/60 rounded-xl flex items-center justify-center z-10 shadow-[0_0_30px_rgba(217,70,239,0.2)]">
        <span className="text-[14px] tracking-widest font-mono font-black text-[#d946ef] rotate-[-90deg]">CONCAT</span>
      </div>

      {/* Final 1x1 Conv Node */}
      <div className="absolute top-[50%] left-[92%] w-[40px] h-[60px] -translate-x-1/2 -translate-y-1/2 bg-slate-800/90 border border-pink-500/60 rounded flex items-center justify-center shadow-lg z-10">
        <span className="text-[8px] font-mono text-pink-300 text-center leading-tight">1x1<br/>Conv</span>
      </div>
    </>
  );
}
