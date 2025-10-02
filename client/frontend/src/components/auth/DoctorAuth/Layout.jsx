
// ===============================================================================================================================================
//                                               Under development
// ===============================================================================================================================================




// import { useState } from 'react';
import { useLoading } from '../../../store.js';
// import DoctorLogin from './DoctorLogin.jsx';
// import DoctorRegister from './DoctorRegister.jsx';
import Loader from '../../../ui/Loader.jsx';
import { XCircle } from 'lucide-react';

const DoctorAuthLayout = () => {
  const { isLoading } = useLoading();
  // const [login, setLogin] = useState(true);

  if (isLoading) {
    return <Loader message="Processing..." />;
  }

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        {/* <div className="w-16 h-16 bg-gradient-to-r from-[#10B981] to-[#059669] rounded-full mx-auto mb-4 flex items-center justify-center">
          <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div> */}
        <div className="inline-flex items-center gap-2 rounded-full bg-red-900/50 px-4 py-2 text-sm font-medium text-red-300">
          <XCircle className="h-5 w-5" />
          <span>Under Development.. Stay tuned!</span>
        </div>
        {/* <h2 className="text-3xl font-bold text-white mb-2">
          {login ? 'Doctor Login' : 'Doctor Registration'}
        </h2>
        <p className="text-[#B8B8B8]">
          {login ? 'Access your professional dashboard' : 'Join our medical network'}
        </p> */}
      </div>

      {/* {login ? (
        <DoctorLogin onToggleMode={() => setLogin(false)} />
      ) : (
        <DoctorRegister onToggleMode={() => setLogin(true)} />
      )} */}
    </div>
  );
};

export default DoctorAuthLayout;
