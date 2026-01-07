export default function Shine() {
  return (
    <div className="w-full h-[2px] mx-auto lg:w-5xl relative z-10">
      {/* Primary Deep Glow */}
      <div
        className="
          absolute left-1/2 -translate-x-1/2
          w-[99%] h-[29px] rounded-full
          filter blur-[24.5px] mix-blend-lighten opacity-30
          bg-[radial-gradient(50%_50%,_#C084FC_0%,_#C084FC66_100%)]
          "
      ></div>

      {/* Secondary Soft Glow */}
      <div
        className="
          absolute left-1/2 -translate-x-1/2
          w-[64%] h-[17px] rounded-full
          filter blur-[40.5px] mix-blend-lighten opacity-80
          bg-[radial-gradient(50%_50%,_#C084FC_0%,_#C084FC33_100%)]
        "
      ></div>

      {/* Inner Purple Tint */}
      <div
        className="
          absolute left-1/2 -translate-x-1/2
          w-[60.8%] h-[17px] rounded-full
          filter blur-[7px] mix-blend-lighten opacity-20
          bg-[radial-gradient(50%_50%,_#F3E8FF_0%,_#C084FC66_100%)]
        "
      ></div>

      {/* Core Highlight Line (Brightest) */}
      <div
        className="
          absolute left-1/2 -translate-x-1/2
          w-[43.5%] h-[5px] rounded-full
          filter blur-md mix-blend-lighten opacity-80
          bg-[radial-gradient(50%_50%,_#FFF_0%,_#C084FC66_100%)]
        "
      ></div>

      {/* Sharp Center Line */}
      <div
        className="
          absolute left-1/2 -translate-x-1/2
          w-[99%] h-[2px] rounded-full
          filter
          bg-[radial-gradient(50%_50%,_#F3E8FF_0%,_#C084FC00_100%)]
        "
      ></div>

      {/* Large Ambient Background Blur */}
      <div
        className="
          absolute left-1/2 -translate-x-1/2
          w-full h-[398px] rounded-full
          filter blur-[135px] mix-blend-lighten opacity-10
          bg-[#C084FC]
        "
      ></div>
    </div>
  );
}