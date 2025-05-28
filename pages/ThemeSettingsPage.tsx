
import React from 'react';
import { useAppContext } from '../contexts/AppContext';
import { Theme } from '../types';
// Removed incorrect import: import { SunIcon, MoonIcon } from '../components/icons/HeroIcons'; 

const ThemeSettingsPage: React.FC = () => {
  const { theme, setTheme } = useAppContext();

  const handleThemeChange = (selectedTheme: Theme) => {
    setTheme(selectedTheme);
  };

  const SunIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => ( 
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" />
    </svg>
  );
  const MoonIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => ( 
     <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z" />
    </svg>
  );


  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold text-neutral-700 dark:text-neutral-200">Theme Settings</h2>

      <div className="bg-white dark:bg-neutral-800 p-6 rounded-lg shadow-lg">
        <h3 className="text-lg font-medium text-neutral-700 dark:text-neutral-300 mb-4">Select Your Preferred Theme</h3>
        
        <div className="space-y-3">
          {(['light', 'dark'] as Theme[]).map((mode) => (
            <label
              key={mode}
              className={`flex items-center p-4 border rounded-lg cursor-pointer transition-all duration-200 ease-in-out
                ${theme === mode 
                  ? 'border-primary bg-primary-light bg-opacity-20 dark:border-primary-dark dark:bg-primary-dark dark:bg-opacity-30 shadow-md' 
                  : 'border-neutral-300 dark:border-neutral-600 hover:border-neutral-400 dark:hover:border-neutral-500 hover:shadow-sm'
                }`}
            >
              <input
                type="radio"
                name="theme"
                value={mode}
                checked={theme === mode}
                onChange={() => handleThemeChange(mode)}
                className="form-radio h-5 w-5 text-primary focus:ring-primary-dark border-neutral-400 dark:border-neutral-500 dark:bg-neutral-700 dark:checked:bg-primary mr-3"
              />
              <div className="flex items-center">
                {mode === 'light' ? <SunIcon className="h-6 w-6 mr-2 text-yellow-500" /> : <MoonIcon className="h-6 w-6 mr-2 text-indigo-400" />}
                <span className="text-md font-medium text-neutral-700 dark:text-neutral-200">
                  {mode.charAt(0).toUpperCase() + mode.slice(1)} Mode
                </span>
              </div>
            </label>
          ))}
        </div>
        
        <p className="mt-6 text-sm text-neutral-600 dark:text-neutral-400">
          Your selected theme will be applied across the application and saved for your next visit.
        </p>
      </div>
    </div>
  );
};

export default ThemeSettingsPage;
