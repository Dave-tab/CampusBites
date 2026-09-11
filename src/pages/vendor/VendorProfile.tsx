import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { DataService } from '../../services/dataService';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';
import { Store, Phone, Building, CheckCircle2, Image as ImageIcon } from 'lucide-react';

export const VendorProfile: React.FC = () => {
  const { currentUser } = useAuth();
  const vendor = currentUser ? DataService.getVendorByOwnerId(currentUser.id) : undefined;

  const [businessName, setBusinessName] = useState(vendor?.business_name || '');
  const [description, setDescription] = useState(vendor?.description || '');
  const [phone, setPhone] = useState(vendor?.phone || '');
  const [address, setAddress] = useState(vendor?.address || '');
  const [bannerImage, setBannerImage] = useState(vendor?.banner_image || '');
  const [savedSuccess, setSavedSuccess] = useState(false);

  if (!vendor) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const updated = {
      ...vendor,
      business_name: businessName,
      description,
      phone,
      address,
      banner_image: bannerImage,
      updated_at: new Date().toISOString(),
    };
    DataService.saveVendor(updated);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-200 max-w-2xl mx-auto">
      <div className="flex items-center justify-between border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">{vendor.business_name}</h1>
          <p className="text-xs text-slate-500">Manage business details and storefront banner</p>
        </div>
        <Badge status={vendor.verification_status} />
      </div>

      {savedSuccess && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold rounded-xl flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>Vendor business profile updated successfully!</span>
        </div>
      )}

      <Card className="p-6">
        <form onSubmit={handleSave} className="space-y-4">
          <Input
            label="Business Name"
            value={businessName}
            onChange={(e) => setBusinessName(e.target.value)}
            required
          />

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
              Description
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full p-3 border border-slate-200 rounded-xl text-sm outline-none focus:ring-3 focus:ring-amber-500/20 focus:border-amber-500"
            />
          </div>

          <Input
            label="Contact Phone"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            leftIcon={<Phone className="w-4 h-4" />}
            required
          />

          <Input
            label="Stall / Physical Address"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            leftIcon={<Building className="w-4 h-4" />}
            required
          />

          <Input
            label="Banner Cover Image URL"
            value={bannerImage}
            onChange={(e) => setBannerImage(e.target.value)}
            leftIcon={<ImageIcon className="w-4 h-4" />}
          />

          <Button type="submit">Save Vendor Details</Button>
        </form>
      </Card>
    </div>
  );
};
