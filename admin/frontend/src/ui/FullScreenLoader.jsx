import Logo from '../assets/Logo1.png'; 

const FullScreenLoader = ({ message }) => {
  return (
    <div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center 
                 bg-neutral-950/80 backdrop-blur-md"
    >
      <div className="relative flex items-center justify-center">
        <div
          className="absolute h-28 w-28 rounded-full border-2 border-solid 
                     border-t-white border-l-white 
                     border-r-white/30 border-b-white/30 
                     animate-[spin_1.5s_linear_infinite]"
        ></div>

        <img
          src={Logo}
          alt="Loading..."
          className="h-16 w-16 animate-pulse"
        />
      </div>

      <p className="mt-8 text-lg font-medium text-neutral-300 tracking-wider">
        {message ? message : "Getting things ready..."}
      </p>
    </div>
  );
};

export default FullScreenLoader;