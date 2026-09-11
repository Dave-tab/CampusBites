import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { DataService } from '../../services/dataService';
import { VendorApplication } from '../../types';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Modal } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';
import { EmptyState } from '../../components/ui/EmptyState';
import {
  Store,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Phone,
  MapPin,
  FileText,
  Mail,
  User,
  ArrowRight,
  Sparkles,
  ExternalLink,
} from 'lucide-react';

export const AdminPendingVendors: React.FC = () => {
  const { currentUser, loginAsDemoRole } = useAuth();
  const navigate = useNavigate();
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [selectedApp, setSelectedApp] = useState<VendorApplication | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [successBanner, setSuccessBanner] = useState<{
    message: string;
    vendorOwnerId: string;
    vendorName: string;
  } | null>(null);

  // Sync state on storage events
  useEffect(() => {
    const handleSync = () => setRefreshTrigger((prev) => prev + 1);
    window.addEventListener('storage', handleSync);
    window.addEventListener('campusbites_vendor_updated', handleSync);
    return () => {
      window.removeEventListener('storage', handleSync);
      window.removeEventListener('campusbites_vendor_updated', handleSync);
    };
  }, []);

  const applications = DataService.getVendorApplications();
  const pendingApps = applications.filter((a) => a.verification_status === 'PENDING');
  const pastApps = applications.filter((a) => a.verification_status !== 'PENDING');

  const handleApprove = (app: VendorApplication) => {
    if (!currentUser) return;
    const approvedVendor = DataService.approveVendorApplication(app.id, currentUser.id);
    setRefreshTrigger((prev) => prev + 1);
    window.dispatchEvent(new Event('storage'));
    window.dispatchEvent(new CustomEvent('campusbites_vendor_updated'));

    setSuccessBanner({
      message: `"${app.business_name}" has been approved and activated on Campus Bite!`,
      vendorOwnerId: app.applicant_id,
      vendorName: app.business_name,
    });
  };

  const handleReject = () => {
    if (!currentUser || !selectedApp || !rejectionReason.trim()) return;
    DataService.rejectVendorApplication(selectedApp.id, currentUser.id, rejectionReason);
    setRejectModalOpen(false);
    setSelectedApp(null);
    setRejectionReason('');
    setRefreshTrigger((prev) => prev + 1);
    window.dispatchEvent(new Event('storage'));
    window.dispatchEvent(new CustomEvent('campusbites_vendor_updated'));
  };

  const handleSwitchToVendor = (ownerId: string) => {
    loginAsDemoRole('VENDOR', ownerId);
    navigate('/vendor/dashboard');
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-200">
      <div className="border-b border-slate-200 pb-4">
        <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
          <ShieldCheck className="w-6 h-6 text-emerald-600" /> Vendor Applications Verification
        </h1>
        <p className="text-xs text-slate-500">
          Review business information, location specifications, and supporting permits before activating vendor accounts
        </p>
      </div>

      {/* Instant Action Approval Banner */}
      {successBanner && (
        <div className="p-4 bg-emerald-50 border-2 border-emerald-300 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-in slide-in-from-top duration-300 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-black text-emerald-950">{successBanner.message}</p>
              <p className="text-xs text-emerald-800">
                The vendor profile is live. Their menu, orders, and dashboard are fully unlocked.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => handleSwitchToVendor(successBanner.vendorOwnerId)}
              className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-black rounded-xl shadow-xs flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <span>Open {successBanner.vendorName} Console</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setSuccessBanner(null)}
              className="p-2 text-emerald-800 hover:text-emerald-950 hover:bg-emerald-100/60 rounded-xl text-xs font-bold"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* Pending Applications List */}
      <div className="space-y-4">
        <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
          <Store className="w-4 h-4 text-amber-600" /> Applications Requiring Review ({pendingApps.length})
        </h2>

        {pendingApps.length === 0 ? (
          <EmptyState
            icon={<CheckCircle2 className="w-12 h-12 text-emerald-500" />}
            title="All Applications Processed"
            description="There are currently no pending vendor verification applications awaiting administrator review."
          />
        ) : (
          <div className="space-y-4">
            {pendingApps.map((app) => (
              <Card key={app.id} className="p-6 border-2 border-amber-200 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-black text-slate-900">{app.business_name}</h3>
                      <Badge status={app.location_type} />
                    </div>
                    <span className="text-xs text-slate-500">
                      Submitted on {new Date(app.created_at).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      className="bg-emerald-600 hover:bg-emerald-700 border-emerald-600 cursor-pointer"
                      onClick={() => handleApprove(app)}
                      leftIcon={<CheckCircle2 className="w-4 h-4" />}
                    >
                      Approve & Activate Vendor
                    </Button>
                    <Button
                      variant="danger"
                      size="sm"
                      className="cursor-pointer"
                      onClick={() => {
                        setSelectedApp(app);
                        setRejectModalOpen(true);
                      }}
                      leftIcon={<XCircle className="w-4 h-4" />}
                    >
                      Reject Application
                    </Button>
                  </div>
                </div>

                {/* Applicant & Location Details Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs bg-slate-50 p-4 rounded-2xl border border-slate-100">
                  <div className="space-y-1">
                    <span className="font-bold text-slate-900 block flex items-center gap-1">
                      <User className="w-3.5 h-3.5 text-amber-600" /> Applicant Contact:
                    </span>
                    <p className="text-slate-800">{app.applicant_name || 'Owner'}</p>
                    <p className="text-slate-500 flex items-center gap-1">
                      <Mail className="w-3 h-3 text-slate-400" /> {app.applicant_email}
                    </p>
                    <p className="text-slate-500 flex items-center gap-1">
                      <Phone className="w-3 h-3 text-slate-400" /> {app.phone}
                    </p>
                  </div>

                  <div className="space-y-1">
                    <span className="font-bold text-slate-900 block flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-amber-600" /> Location Specs:
                    </span>
                    <p className="text-slate-800 font-medium">{app.address}</p>
                    {app.location_description && (
                      <p className="text-slate-500 text-[11px]">({app.location_description})</p>
                    )}
                  </div>
                </div>

                <div className="space-y-1 text-xs">
                  <span className="font-bold text-slate-900 block">Business Description:</span>
                  <p className="text-slate-600 leading-relaxed bg-white p-3 rounded-xl border border-slate-100">
                    {app.description}
                  </p>
                </div>

                {app.supporting_info && (
                  <div className="space-y-1 text-xs">
                    <span className="font-bold text-slate-900 block flex items-center gap-1">
                      <FileText className="w-3.5 h-3.5 text-amber-600" /> Supporting Permits / License Notes:
                    </span>
                    <p className="text-slate-600 bg-amber-50/50 p-3 rounded-xl border border-amber-100 font-mono text-[11px]">
                      {app.supporting_info}
                    </p>
                  </div>
                )}
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Historical Reviewed Applications */}
      {pastApps.length > 0 && (
        <div className="space-y-4 pt-6 border-t border-slate-200">
          <h2 className="text-base font-bold text-slate-900">Reviewed Applications History ({pastApps.length})</h2>

          <div className="space-y-3">
            {pastApps.map((a) => (
              <Card key={a.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 text-sm">{a.business_name}</span>
                    <Badge status={a.verification_status} />
                  </div>
                  <span className="text-slate-500">Applicant: {a.applicant_name} ({a.phone})</span>
                  {a.rejection_reason && (
                    <span className="block text-rose-600 font-medium mt-0.5">Reason: {a.rejection_reason}</span>
                  )}
                  <span className="block text-slate-400 text-[11px] mt-0.5">
                    Reviewed {a.reviewed_at ? new Date(a.reviewed_at).toLocaleDateString() : ''}
                  </span>
                </div>

                {a.verification_status === 'APPROVED' && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="cursor-pointer text-xs"
                    onClick={() => handleSwitchToVendor(a.applicant_id)}
                    leftIcon={<Store className="w-3.5 h-3.5 text-indigo-600" />}
                  >
                    Open Vendor Console
                  </Button>
                )}
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Reject Reason Modal */}
      <Modal isOpen={rejectModalOpen} onClose={() => setRejectModalOpen(false)} title="Reject Vendor Application">
        <div className="space-y-4">
          <p className="text-xs text-slate-600">
            Provide a mandatory rejection reason to inform <span className="font-bold">{selectedApp?.business_name}</span>.
          </p>

          <Input
            label="Rejection Reason*"
            placeholder="e.g. Invalid food hygiene license, location not within approved campus radius..."
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.target.value)}
            required
          />

          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" size="sm" onClick={() => setRejectModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="danger" size="sm" disabled={!rejectionReason.trim()} onClick={handleReject}>
              Confirm Rejection
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
