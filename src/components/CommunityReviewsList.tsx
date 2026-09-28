'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { CommunityReview, CategoryMetric } from '../types';
import { StarRating } from './StarRating';
import { ImageUploader } from './ImageUploader';
import { useStore } from '../lib/store';
import { useAuth } from '../lib/auth-context';
import { ThumbsUp, ShieldCheck, MessageSquarePlus, Check, X, User, Camera } from 'lucide-react';

interface CommunityReviewsListProps {
  productId: string;
  metrics: CategoryMetric[];
}

export function CommunityReviewsList({
  productId,
  metrics,
}: CommunityReviewsListProps) {
  const { reviews, addCommunityReview, voteHelpful } = useStore();
  const { user, openAuthModal } = useAuth();
  const [showModal, setShowModal] = useState(false);
  const [votedIds, setVotedIds] = useState<Record<string, boolean>>({});

  // Review Form State
  const [userName, setUserName] = useState(user?.name || '');
  const [title, setTitle] = useState('');
  const [comment, setComment] = useState('');
  const [rating, setRating] = useState(5);
  const [verifiedBuyer, setVerifiedBuyer] = useState(true);
  const [reviewPhoto, setReviewPhoto] = useState<string>('');
  const [metricScores, setMetricScores] = useState<Record<string, number>>(() => {
    const initial: Record<string, number> = {};
    metrics.forEach((m) => {
      initial[m.key] = 9;
    });
    return initial;
  });

  const productReviews = reviews.filter(
    (r) => r.productId === productId && r.status === 'approved'
  );

  const handleOpenModal = () => {
    if (user) {
      setUserName(user.name);
      setVerifiedBuyer(true);
    }
    setShowModal(true);
  };

  const handleVote = (reviewId: string) => {
    if (votedIds[reviewId]) return;
    voteHelpful(reviewId);
    setVotedIds((prev) => ({ ...prev, [reviewId]: true }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userName.trim() || !comment.trim() || !title.trim()) {
      alert('Please fill out all required fields.');
      return;
    }

    addCommunityReview({
      productId,
      userName: userName.trim(),
      userAvatar: user?.avatar || `https://images.unsplash.com/photo-${1535713875000 + Math.floor(Math.random() * 500)}?auto=format&fit=crop&w=150&q=80`,
      rating,
      title: title.trim(),
      comment: comment.trim(),
      verifiedBuyer: Boolean(user) || verifiedBuyer,
      metricScores,
      photos: reviewPhoto ? [reviewPhoto] : undefined,
    });

    setShowModal(false);
    setTitle('');
    setComment('');
    setReviewPhoto('');
  };

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-100 gap-4">
        <div>
          <h3 className="text-xl font-bold text-slate-900">Community Reviews & Discussions</h3>
          <p className="text-xs text-slate-500 mt-1">
            Real feedback from verified buyers and community testers
          </p>
        </div>

        <button
          onClick={handleOpenModal}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold shadow-sm transition-all hover:shadow"
        >
          <MessageSquarePlus className="w-4 h-4" />
          Write a Review
        </button>
      </div>

      {/* Reviews List */}
      <div className="divide-y divide-slate-100 mt-6">
        {productReviews.length === 0 ? (
          <div className="py-12 text-center">
            <p className="text-slate-400 text-sm">No community reviews yet.</p>
            <p className="text-xs text-slate-500 mt-1">
              Be the first to share your experience with this product!
            </p>
          </div>
        ) : (
          productReviews.map((rev) => (
            <div key={rev.id} className="py-6 first:pt-0 last:pb-0">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="relative w-10 h-10 rounded-full overflow-hidden bg-slate-100 border border-slate-200">
                    <Image
                      src={rev.userAvatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80'}
                      alt={rev.userName}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-slate-900">
                        {rev.userName}
                      </span>
                      {rev.verifiedBuyer && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                          <ShieldCheck className="w-3 h-3 text-emerald-600" />
                          Verified Buyer
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <StarRating rating={rev.rating} size="sm" />
                      <span className="text-xs text-slate-400">• {rev.createdAt}</span>
                    </div>
                  </div>
                </div>

                {/* Helpful Button */}
                <button
                  onClick={() => handleVote(rev.id)}
                  disabled={votedIds[rev.id]}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border ${
                    votedIds[rev.id]
                      ? 'bg-slate-50 text-emerald-700 border-emerald-200 cursor-default'
                      : 'bg-white hover:bg-slate-50 text-slate-600 border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <ThumbsUp className={`w-3.5 h-3.5 ${votedIds[rev.id] ? 'fill-emerald-600 text-emerald-600' : ''}`} />
                  <span>Helpful ({rev.helpfulCount})</span>
                </button>
              </div>

              {/* Review Content */}
              <div className="mt-3 pl-13">
                <h4 className="text-sm font-bold text-slate-900">{rev.title}</h4>
                <p className="text-sm text-slate-600 mt-1 leading-relaxed">
                  {rev.comment}
                </p>

                {/* User Attached Photos */}
                {rev.photos && rev.photos.length > 0 && (
                  <div className="flex flex-wrap gap-2.5 mt-3">
                    {rev.photos.map((photo, pIdx) => (
                      <div
                        key={pIdx}
                        className="relative w-20 h-20 rounded-xl overflow-hidden border border-slate-200 bg-slate-100 group cursor-pointer"
                        onClick={() => window.open(photo, '_blank')}
                      >
                        <img
                          src={photo}
                          alt="Customer purchase"
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        />
                        <div className="absolute bottom-0 inset-x-0 bg-slate-950/70 text-[9px] text-white font-bold text-center py-0.5">
                          Buyer Photo
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Metric pill ratings if provided */}
                {rev.metricScores && Object.keys(rev.metricScores).length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-slate-50">
                    {metrics.map((m) => {
                      const score = rev.metricScores?.[m.key];
                      if (score === undefined) return null;
                      return (
                        <span
                          key={m.key}
                          className="text-[11px] bg-slate-100 px-2 py-1 rounded text-slate-700 font-medium"
                        >
                          {m.label}: <strong className="text-slate-900">{score}/10</strong>
                        </span>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Write Review Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-100">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-900">
                Write a Verified Community Review
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* User status callout */}
            {user ? (
              <div className="p-3 mt-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2 text-xs text-emerald-800">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Posting with authenticated profile: <strong>{user.name}</strong> (Verified Reviewer)</span>
              </div>
            ) : (
              <div className="p-3 mt-4 bg-indigo-50 border border-indigo-100 rounded-xl flex items-center justify-between text-xs text-indigo-900">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-indigo-600 shrink-0" />
                  <span>Want a <strong>Verified Reviewer</strong> badge?</span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    openAuthModal('login');
                  }}
                  className="font-bold text-indigo-600 hover:text-indigo-800 underline ml-2"
                >
                  Sign In
                </button>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4 mt-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Overall Rating
                </label>
                <div className="flex items-center gap-3">
                  <StarRating
                    rating={rating}
                    size="lg"
                    interactive
                    onChange={(r) => setRating(r)}
                  />
                  <span className="text-sm font-bold text-slate-800">
                    {rating} of 5 Stars
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Your Full Name / Nickname
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Sarah Chen"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Headline / Summary
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Best investment I made this year!"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  In-Depth Feedback
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="Share details on build, real-life usage, quirks, or long-term thoughts..."
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* Dynamic Criteria Evaluation Sliders */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 space-y-3">
                <div className="text-xs font-bold text-slate-800 uppercase tracking-wide">
                  Dynamic Category Ratings (1 - 10)
                </div>
                {metrics.map((m) => (
                  <div key={m.key} className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="font-semibold text-slate-700">{m.label}</span>
                      <span className="font-bold text-indigo-600">
                        {metricScores[m.key] ?? 8} / 10
                      </span>
                    </div>
                    <input
                      type="range"
                      min={1}
                      max={10}
                      step={1}
                      value={metricScores[m.key] ?? 8}
                      onChange={(e) =>
                        setMetricScores((prev) => ({
                          ...prev,
                          [m.key]: Number(e.target.value),
                        }))
                      }
                      className="w-full accent-indigo-600"
                    />
                  </div>
                ))}
              </div>

              {/* Attach Product Photo */}
              <div className="pt-2">
                <ImageUploader
                  value={reviewPhoto}
                  onChange={setReviewPhoto}
                  label="Attach Real-World Product Photo (Optional)"
                  helperText="Upload an authentic picture of your product to help other buyers verify your experience."
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="verified"
                  checked={verifiedBuyer}
                  onChange={(e) => setVerifiedBuyer(e.target.checked)}
                  className="rounded text-indigo-600 focus:ring-indigo-500 h-4 w-4"
                />
                <label htmlFor="verified" className="text-xs text-slate-600 select-none">
                  I confirm I have purchased or hands-on tested this product
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 text-sm font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold shadow-md transition-all"
                >
                  Submit Review
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
