import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { DataService } from '../../services/dataService';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Badge } from '../../components/ui/Badge';
import { Store, Building, Phone, FileText, CheckCircle2, Clock, AlertTriangle, ArrowRight } from 'lucide-react';

export const VendorApplicationForm: React.FC = () => {
  const { currentUser } = useAuth();
  const existingVendor = currentUser ? DataService.getVendorByOwnerId(currentUser.id) : undefined;

  const [businessName, setBusinessName] = useState(existingVendor?.business_name || '');
  const [description, setDescription] = useState(existingVendor?.description || '');
  const [phone, setPhone] = useState(existingVendor?.phone || currentUser?.phone || '');
  const [locationType, setLocationType] = useState<'CAMPUS' | 'OFF_CAMPUS'>(existingVendor?.location_type || 'CAMPUS');
  const [address, setAddress] = useState(existingVendor?.address || '');
  const [locationDescription, setLocationDescription] = useState(existingVendor?.location_description || '');
  const [supportingInfo, setSupportingInfo] = useState(
    'Health & Food Safety Permit attached. Student Union Food Vendor License verified.'
  );

  const [submittedSuccess, setSubmittedSuccess] = useState(false);

  if (!currentUser) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    DataService.submitVendorApplication({
      applicant_id: currentUser.id,
      applicant_name: currentUser.full_name,
      applicant_email: currentUser.email,
      business_name: businessName,
      description,
      phone,
      location_type: locationType,
      address,
      location_description: locationDescription,
      supporting_info: supportingInfo,
    });
    setSubmittedSuccess(true);
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-200 max-w-2xl mx-auto">
      <div className="flex items-center gap-3 border-b border-slate-200 pb-4">
        <div className="w-12 h-12 rounded-2xl bg-amber-600 text-white flex items-center justify-center font-bold text-lg">
          <Store className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Vendor Registration & Verification</h1>
          <p className="text-xs text-slate-500">Submit your campus food business application for administrator review</p>
        </div>
      </div>

      {existingVendor && (
        <Card className="p-4 bg-slate-50 border border-slate-200 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-900">Current Application Status:</span>
            <Badge status={existingVendor.verification_status} />
          </div>
          {existingVendor.rejection_reason && (
            <p className="text-xs text-rose-700 bg-rose-50 p-2.5 rounded-xl border border-rose-200 font-medium">
              Rejection Note: {existingVendor.rejection_reason}
            </p>
          )}
        </Card>
      )}

      {submittedSuccess ? (
        <Card className="p-8 text-center space-y-4 border-2 border-emerald-200 bg-emerald-50/30">
          <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
          <h2 className="text-xl font-bold text-slate-900">Application Submitted Successfully!</h2>
          <p className="text-xs text-slate-600 leading-relaxed max-w-md mx-auto">
            Your vendor application for <span className="font-bold">{businessName}</span> has been sent to the platform administrators. You will be notified in-app once verified.
          </p>
        </Card>
      ) : (
        <Card className="p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Business / Vendor Name*"
              placeholder="e.g. Mama Cass Kitchen"
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
              required
            />

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                Business Description*
              </label>
              <textarea
                rows={3}
                placeholder="Describe your cuisines, specialty dishes, and service focus..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full p-3 border border-slate-200 rounded-xl text-sm focus:ring-3 focus:ring-amber-500/20 focus:border-amber-500 outline-none"
                required
              />
            </div>

            <Input
              label="Contact Phone Number*"
              placeholder="+234 802 345 6789"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              leftIcon={<Phone className="w-4 h-4" />}
              required
            />

            <Select
              label="Location Classification*"
              value={locationType}
              onChange={(e) => setLocationType(e.target.value as 'CAMPUS' | 'OFF_CAMPUS')}
              options={[
                { value: 'CAMPUS', label: 'ON CAMPUS - Inside Student Union / Faculty Food Courts' },
                { value: 'OFF_CAMPUS', label: 'OFF CAMPUS - Nearby campus gate extension / road' },
              ]}
            />

            <Input
              label="Physical Stall / Shop Address*"
              placeholder="e.g. SUB Building, Block B, Shop 12"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              leftIcon={<Building className="w-4 h-4" />}
              required
            />

            <Input
              label="Location Landmark / Additional Info"
              placeholder="e.g. Opposite Main Auditorium Ground Floor"
              value={locationDescription}
              onChange={(e) => setLocationDescription(e.target.value)}
            />

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                Supporting Verification Info / License Notes
              </label>
              <textarea
                rows={2}
                placeholder="Permit numbers, CAC registration, or health hygiene clearance details..."
                value={supportingInfo}
                onChange={(e) => setSupportingInfo(e.target.value)}
                className="w-full p-3 border border-slate-200 rounded-xl text-sm focus:ring-3 focus:ring-amber-500/20 focus:border-amber-500 outline-none"
              />
            </div>

            <Button className="w-full mt-2" size="lg" type="submit" rightIcon={<ArrowRight className="w-4 h-4" />}>
              Submit Vendor Application for Verification
            </Button>
          </form>
        </Card>
      )}
    </div>
  );
};
