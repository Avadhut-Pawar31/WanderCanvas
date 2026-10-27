'use client';

import { useState } from 'react';
import { Place, CommunityHygieneReport } from '@/types';
import { HygieneService } from '@/services/hygieneService';
import { 
  X, 
  ShieldCheck, 
  Star, 
  Clock, 
  UserCheck, 
  HeartHandshake,
  Send
} from 'lucide-react';
import toast from 'react-hot-toast';

interface HygieneReportModalProps {
  place: Place;
  isOpen: boolean;
  onClose: () => void;
  currentUser?: { id: string; name: string } | null;
}

export function HygieneReportModal({
  place,
  isOpen,
  onClose,
  currentUser,
}: HygieneReportModalProps) {
  const [activeTab, setActiveTab] = useState<'evidence' | 'community' | 'submit'>('evidence');
  const [communityReports, setCommunityReports] = useState<CommunityHygieneReport[]>(() => {
    return HygieneService.getCommunityReports(place.id);
  });

  // Submission Form State
  const [rating, setRating] = useState<number>(5);
  const [soapAvailable, setSoapAvailable] = useState<boolean>(true);
  const [runningWater, setRunningWater] = useState<boolean>(true);
  const [flushWorking, setFlushWorking] = useState<boolean>(true);
  const [comments, setComments] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  if (!isOpen) return null;

  const statusBadge = HygieneService.getStatusBadge(place.hygieneStatus);
  const checklist = place.checklist;

  const handleSubmitReport = (e: React.FormEvent) => {
    e.preventDefault();
    if (!comments.trim()) {
      toast.error('Please share a brief note about the washroom condition.');
      return;
    }

    setIsSubmitting(true);
    try {
      const newReport = HygieneService.submitCommunityReport(place.id, {
        userId: currentUser?.id || `anon-${Date.now()}`,
        userName: currentUser?.name || 'Verified Traveler',
        cleanlinessRating: rating,
        soapAvailable,
        runningWater,
        flushWorking,
        comments: comments.trim(),
      });

      setCommunityReports(prev => [newReport, ...prev]);
      toast.success('Thank you! Your hygiene audit report has been recorded.');
      setComments('');
      setActiveTab('community');
    } catch {
      toast.error('Could not save report. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-[#244536]/15 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="p-6 border-b border-[#244536]/10 flex items-start justify-between bg-[#F7F5EF]">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className={`text-xs px-2.5 py-0.5 rounded-md border font-medium ${statusBadge.color}`}>
                {statusBadge.label}
              </span>
              {place.hygieneScore && (
                <span className="text-xs font-bold text-[#244536] bg-white px-2 py-0.5 rounded-md border border-[#244536]/10">
                  Hygiene Score: {place.hygieneScore}/100
                </span>
              )}
            </div>

            <h3 className="font-serif text-2xl font-medium text-[#244536]">
              {place.name}
            </h3>
            <p className="text-xs text-[#5F6761] mt-0.5">
              {place.address} · {place.city}
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-[#5F6761] hover:text-[#244536] hover:bg-black/5 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-[#244536]/10 px-6 bg-white gap-6">
          <button
            onClick={() => setActiveTab('evidence')}
            className={`py-3 text-xs sm:text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'evidence'
                ? 'border-[#244536] text-[#244536]'
                : 'border-transparent text-[#5F6761] hover:text-[#244536]'
            }`}
          >
            Verified Evidence &amp; Checklist
          </button>
          <button
            onClick={() => setActiveTab('community')}
            className={`py-3 text-xs sm:text-sm font-medium border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'community'
                ? 'border-[#244536] text-[#244536]'
                : 'border-transparent text-[#5F6761] hover:text-[#244536]'
            }`}
          >
            <span>Community Reports</span>
            <span className="text-[11px] px-1.5 py-0.2 rounded-full bg-[#E7ECE5] text-[#244536] font-semibold">
              {communityReports.length}
            </span>
          </button>
          <button
            onClick={() => setActiveTab('submit')}
            className={`py-3 text-xs sm:text-sm font-medium border-b-2 transition-colors text-[#C78363] ${
              activeTab === 'submit'
                ? 'border-[#C78363] font-semibold'
                : 'border-transparent hover:text-[#B37050]'
            }`}
          >
            + Submit Report
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-[#292D2A]">
          {/* TAB 1: VERIFIED EVIDENCE & CHECKLIST */}
          {activeTab === 'evidence' && (
            <div className="space-y-6">
              {/* Evidence Attribution & Audit Log */}
              <div className="p-4 rounded-2xl bg-[#F0F3EF] border border-[#244536]/10 space-y-2">
                <div className="flex items-center justify-between text-xs font-semibold text-[#244536]">
                  <span className="flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-[#244536]" />
                    Evidence Source: {place.evidenceSource || 'Official Public Inspection Log'}
                  </span>
                  <span>Verified: {place.lastVerifiedDate || 'Recent'}</span>
                </div>
                <p className="text-xs text-[#5F6761] leading-relaxed">
                  {statusBadge.description}
                </p>
                {checklist?.inspectorIdentity && (
                  <div className="pt-2 border-t border-[#244536]/10 flex items-center gap-1.5 text-[11px] text-[#244536] font-medium">
                    <UserCheck className="w-3.5 h-3.5 text-[#C78363]" />
                    <span>Audited by: {checklist.inspectorIdentity}</span>
                  </div>
                )}
              </div>

              {/* Facility Checklist Grid */}
              <div>
                <h4 className="text-xs font-semibold uppercase tracking-wider text-[#5F6761] mb-3">
                  Washroom &amp; Sanitation Checklist
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="p-3.5 rounded-xl border border-[#244536]/10 bg-white flex items-center justify-between">
                    <span className="font-medium text-[#292D2A]">Visible Cleanliness</span>
                    <span className="font-bold text-[#244536]">
                      {checklist?.visibleCleanlinessScore || 4} / 5 Stars
                    </span>
                  </div>

                  <div className="p-3.5 rounded-xl border border-[#244536]/10 bg-white flex items-center justify-between">
                    <span className="font-medium text-[#292D2A]">Continuous Running Water</span>
                    <span className={`px-2 py-0.5 rounded text-[11px] font-semibold ${place.waterAvailable ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {place.waterAvailable ? 'Verified Available' : 'Unavailable'}
                    </span>
                  </div>

                  <div className="p-3.5 rounded-xl border border-[#244536]/10 bg-white flex items-center justify-between">
                    <span className="font-medium text-[#292D2A]">Soap &amp; Hand Sanitizer</span>
                    <span className={`px-2 py-0.5 rounded text-[11px] font-semibold ${place.soapAvailable ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'}`}>
                      {place.soapAvailable ? 'Stocked' : 'Not Stocked'}
                    </span>
                  </div>

                  <div className="p-3.5 rounded-xl border border-[#244536]/10 bg-white flex items-center justify-between">
                    <span className="font-medium text-[#292D2A]">Toilet Functionality</span>
                    <span className="font-bold text-[#244536]">
                      {checklist?.toiletFunctionalityScore || 4} / 5 Rating
                    </span>
                  </div>

                  <div className="p-3.5 rounded-xl border border-[#244536]/10 bg-white flex items-center justify-between">
                    <span className="font-medium text-[#292D2A]">Wheelchair Accessible</span>
                    <span className="font-medium text-[#244536]">
                      {place.accessibleFacility ? 'Yes (Step-free / Grab bars)' : 'Standard Access'}
                    </span>
                  </div>

                  <div className="p-3.5 rounded-xl border border-[#244536]/10 bg-white flex items-center justify-between">
                    <span className="font-medium text-[#292D2A]">Access Condition</span>
                    <span className="font-medium text-[#244536] capitalize">
                      {place.washroomAvailability.replace('_', ' ')}
                    </span>
                  </div>
                </div>

                {checklist?.notes && (
                  <div className="mt-4 p-3.5 rounded-xl bg-[#F7F5EF] border border-[#244536]/10 text-xs text-[#5F6761]">
                    <span className="font-semibold text-[#244536]">Inspector Notes: </span>
                    {checklist.notes}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: COMMUNITY REPORTS */}
          {activeTab === 'community' && (
            <div className="space-y-4">
              {communityReports.length === 0 ? (
                <div className="text-center py-10 space-y-3">
                  <HeartHandshake className="w-10 h-10 text-[#C78363] mx-auto opacity-70" />
                  <p className="text-sm font-medium text-[#244536]">No traveler reports yet</p>
                  <p className="text-xs text-[#5F6761] max-w-sm mx-auto">
                    Be the first to audit this stop and help fellow travelers find clean, reliable facilities along the route.
                  </p>
                  <button
                    onClick={() => setActiveTab('submit')}
                    className="px-4 py-2 rounded-xl bg-[#C78363] text-white text-xs font-medium hover:bg-[#B37050] transition-colors"
                  >
                    Submit the first report
                  </button>
                </div>
              ) : (
                communityReports.map(report => (
                  <div key={report.id} className="p-4 rounded-2xl bg-[#F7F5EF] border border-[#244536]/10 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-[#244536]">{report.userName}</span>
                        <div className="flex text-amber-500">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star
                              key={i}
                              className={`w-3 h-3 ${i < report.cleanlinessRating ? 'fill-current' : 'text-slate-300'}`}
                            />
                          ))}
                        </div>
                      </div>
                      <span className="text-[11px] text-[#5F6761] flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {report.visitDate}
                      </span>
                    </div>

                    <p className="text-xs text-[#292D2A] leading-relaxed">
                      &quot;{report.comments}&quot;
                    </p>

                    <div className="flex flex-wrap gap-2 pt-2 text-[10px] text-[#5F6761]">
                      <span className={`px-2 py-0.5 rounded-md ${report.runningWater ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {report.runningWater ? '✓ Running Water' : '✗ No Water'}
                      </span>
                      <span className={`px-2 py-0.5 rounded-md ${report.soapAvailable ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'}`}>
                        {report.soapAvailable ? '✓ Soap Stocked' : '✗ Soap Empty'}
                      </span>
                      <span className={`px-2 py-0.5 rounded-md ${report.flushWorking ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'}`}>
                        {report.flushWorking ? '✓ Flush Working' : '✗ Flush Issue'}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* TAB 3: SUBMIT COMMUNITY REPORT */}
          {activeTab === 'submit' && (
            <form onSubmit={handleSubmitReport} className="space-y-5">
              <div>
                <label className="block text-xs font-semibold text-[#244536] mb-1">
                  Overall Cleanliness Rating
                </label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map(val => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => setRating(val)}
                      className="p-1.5 focus:outline-none"
                    >
                      <Star
                        className={`w-6 h-6 ${
                          val <= rating ? 'text-amber-500 fill-amber-500' : 'text-slate-300'
                        }`}
                      />
                    </button>
                  ))}
                  <span className="ml-2 text-xs text-[#5F6761]">
                    ({rating} of 5 Stars)
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-semibold text-[#244536]">
                  Key Facility Checklist
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <label className="p-3 rounded-xl border border-[#244536]/15 bg-[#F7F5EF] flex items-center gap-2 cursor-pointer text-xs">
                    <input
                      type="checkbox"
                      checked={runningWater}
                      onChange={e => setRunningWater(e.target.checked)}
                      className="w-4 h-4 rounded text-[#244536] focus:ring-[#244536]"
                    />
                    <span>Water Working</span>
                  </label>

                  <label className="p-3 rounded-xl border border-[#244536]/15 bg-[#F7F5EF] flex items-center gap-2 cursor-pointer text-xs">
                    <input
                      type="checkbox"
                      checked={soapAvailable}
                      onChange={e => setSoapAvailable(e.target.checked)}
                      className="w-4 h-4 rounded text-[#244536] focus:ring-[#244536]"
                    />
                    <span>Soap Available</span>
                  </label>

                  <label className="p-3 rounded-xl border border-[#244536]/15 bg-[#F7F5EF] flex items-center gap-2 cursor-pointer text-xs">
                    <input
                      type="checkbox"
                      checked={flushWorking}
                      onChange={e => setFlushWorking(e.target.checked)}
                      className="w-4 h-4 rounded text-[#244536] focus:ring-[#244536]"
                    />
                    <span>Flush Working</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#244536] mb-1">
                  Traveler Observations &amp; Notes
                </label>
                <textarea
                  value={comments}
                  onChange={e => setComments(e.target.value)}
                  placeholder="e.g., Very clean rest stop, €1 coin fee or free for café customers. Soap dispensers fully stocked."
                  rows={3}
                  required
                  className="w-full p-3 rounded-xl border border-[#244536]/20 bg-white text-xs text-[#292D2A] focus:outline-none focus:ring-2 focus:ring-[#244536]"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setActiveTab('evidence')}
                  className="px-4 py-2 rounded-xl text-xs font-medium text-[#5F6761] hover:text-[#244536]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 rounded-xl bg-[#244536] text-white text-xs font-medium hover:bg-[#1B3529] transition-colors flex items-center gap-1.5 shadow-sm"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Submit Audit Report</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
