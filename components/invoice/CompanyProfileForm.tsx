
import React, { useState, useEffect } from 'react';
import { CompanyProfile } from '../../types';
import Button from '../common/Button';
import { APP_NAME } from '../../constants';

interface CompanyProfileFormProps {
  currentProfile: CompanyProfile;
  onSave: (profile: CompanyProfile) => void;
  onClose: () => void;
}

const CompanyProfileForm: React.FC<CompanyProfileFormProps> = ({ currentProfile, onSave, onClose }) => {
  const [profile, setProfile] = useState<CompanyProfile>(currentProfile);
  const [logoPreview, setLogoPreview] = useState<string | null>(currentProfile.logo || null);

  useEffect(() => {
    setProfile(currentProfile);
    setLogoPreview(currentProfile.logo || null);
  }, [currentProfile]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setProfile({ ...profile, logo: base64String });
        setLogoPreview(base64String);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(profile);
  };

  const commonInputClass = "mt-1 block w-full px-3 py-2 bg-white dark:bg-neutral-700 border border-neutral-300 dark:border-neutral-600 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm text-neutral-900 dark:text-neutral-100";
  const labelClass = "block text-sm font-medium text-neutral-700 dark:text-neutral-300";

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="companyName" className={labelClass}>Company Name</label>
        <input type="text" name="companyName" id="companyName" value={profile.companyName} onChange={handleChange} required className={commonInputClass} />
      </div>
      <div>
        <label htmlFor="address" className={labelClass}>Address</label>
        <textarea name="address" id="address" value={profile.address} onChange={handleChange} rows={3} required className={commonInputClass}></textarea>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="phone" className={labelClass}>Phone</label>
          <input type="tel" name="phone" id="phone" value={profile.phone} onChange={handleChange} required className={commonInputClass} />
        </div>
        <div>
          <label htmlFor="email" className={labelClass}>Email</label>
          <input type="email" name="email" id="email" value={profile.email} onChange={handleChange} required className={commonInputClass} />
        </div>
      </div>
      <div>
        <label htmlFor="logo" className={labelClass}>Company Logo</label>
        <input type="file" name="logo" id="logo" accept="image/*" onChange={handleLogoChange} className={`${commonInputClass} p-1.5 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary-light file:text-primary-dark dark:file:bg-neutral-600 dark:file:text-neutral-100 hover:file:bg-primary dark:hover:file:bg-neutral-500`} />
        {logoPreview && <img src={logoPreview} alt="Logo Preview" className="mt-2 max-h-20 rounded border border-neutral-200 dark:border-neutral-600 p-1" />}
      </div>
      <div className="flex justify-end space-x-3 pt-4">
        <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
        <Button type="submit">Save Profile</Button>
      </div>
    </form>
  );
};

export default CompanyProfileForm;