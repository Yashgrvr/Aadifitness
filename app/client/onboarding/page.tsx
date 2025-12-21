"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

declare global {
  interface Window {
    Razorpay: any;
  }
}

export default function ClientOnboarding() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [currentWeight, setCurrentWeight] = useState("");
  const [goalWeight, setGoalWeight] = useState("");

  const [fitnessGoal, setFitnessGoal] = useState("weight_loss");
  const [plan, setPlan] = useState("1_month");
  const [paymentProcessing, setPaymentProcessing] = useState(false);

  const clientId =
    typeof window !== "undefined" ? localStorage.getItem("clientId") : "";

  const planAmounts: Record<string, number> = {
    "1_month": 99900,
    "3_months": 249900,
    "6_months": 449900,
  };

  const planPrices: Record<string, string> = {
    "1_month": "₹999",
    "3_months": "₹2,499",
    "6_months": "₹4,499",
  };

  useEffect(() => {
    if (step === 3) {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.async = true;
      document.body.appendChild(script);
      return () => {
        document.body.removeChild(script);
      };
    }
  }, [step]);

  const handleSaveDetails = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (!email || !currentWeight || !goalWeight) {
        throw new Error("Email and weights are required");
      }

      const response = await fetch("/api/clients/save-details", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientId,
          email,
          currentWeight: parseFloat(currentWeight),
          goalWeight: parseFloat(goalWeight),
          fitnessGoal: "weight_loss",
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to save details");
      }

      if (data.clientId && !clientId) {
        localStorage.setItem("clientId", data.clientId);
      }

      setStep(2);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleGoalsAndPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch("/api/clients/save-details", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientId,
          email,
          currentWeight: parseFloat(currentWeight),
          goalWeight: parseFloat(goalWeight),
          fitnessGoal,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to update goals");
      }

      setStep(3);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setPaymentProcessing(true);

    try {
      const orderResponse = await fetch("/api/payment/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientId,
          plan,
          amount: planAmounts[plan],
        }),
      });

      const orderData = await orderResponse.json();

      if (!orderResponse.ok) {
        throw new Error(orderData.message || "Failed to create order");
      }

      const { orderId } = orderData;

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY,
        order_id: orderId,
        amount: planAmounts[plan],
        currency: "INR",
        name: "Aadi Fitness",
        description: `${plan.replace("_", " ")} subscription`,
        prefill: {
          email,
        },
        handler: async (response: any) => {
          try {
            const verifyResponse = await fetch("/api/payment/verify", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                clientId,
                orderId: response.razorpay_order_id,
                paymentId: response.razorpay_payment_id,
                signature: response.razorpay_signature,
                plan,
              }),
            });

            const verifyData = await verifyResponse.json();

            if (!verifyResponse.ok) {
              throw new Error(
                verifyData.message || "Payment verification failed"
              );
            }

            setSuccess(true);
            setError("");

            setTimeout(() => {
              router.push("/client/dashboard");
            }, 3000);
          } catch (err) {
            setError(
              err instanceof Error ? err.message : "Verification failed"
            );
          }
        },
        modal: {
          ondismiss: () => {
            setPaymentProcessing(false);
            setError("Payment cancelled");
          },
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Payment setup failed");
    } finally {
      setPaymentProcessing(false);
    }
  };

  const handlePreviousStep = () => {
    if (step > 1) setStep(step - 1);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-black">
      {/* Background animated gradient */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000" />
        <div className="absolute top-1/2 left-1/2 w-80 h-80 bg-cyan-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000" />
      </div>

      <div className="w-full max-w-md relative z-10">
        {success && (
          <div className="bg-gradient-to-br from-slate-900 to-slate-800 border border-blue-500/30 rounded-2xl shadow-2xl p-8 mb-4 text-center backdrop-blur-sm">
            <div className="text-6xl mb-4">✅</div>
            <h2 className="text-3xl font-bold text-white mb-3">
              Payment Successful!
            </h2>
            <p className="text-gray-300 mb-4 text-lg">
              Your subscription is active. Your trainer will send you a
              password shortly.
            </p>
            <p className="text-sm text-blue-400">
              Redirecting to dashboard...
            </p>
          </div>
        )}

        {!success && (
          <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-black rounded-2xl shadow-2xl overflow-hidden border border-blue-500/20 backdrop-blur-sm">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-cyan-500 p-8 relative overflow-hidden">
              <div className="absolute inset-0 opacity-10">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-transparent" />
              </div>
              <div className="relative z-10">
                <h1 className="text-4xl font-bold text-white mb-2">
                  Aadi Fitness
                </h1>
                <p className="text-blue-100 text-lg">
                  Complete Your Registration
                </p>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="px-8 py-6 border-b border-blue-500/10">
              <div className="flex justify-between mb-3">
                <span className="text-xs font-semibold text-blue-400 uppercase tracking-wider">
                  Step {step} of 3
                </span>
              </div>
              <div className="w-full bg-slate-700 rounded-full h-2.5 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-blue-500 to-cyan-400 h-2.5 rounded-full transition-all duration-300 shadow-lg shadow-blue-500/50"
                  style={{ width: `${(step / 3) * 100}%` }}
                />
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="mx-8 mt-6 p-4 bg-red-950/50 border border-red-500/50 text-red-300 rounded-xl text-sm backdrop-blur-sm">
                ⚠️ {error}
              </div>
            )}

            {/* Form */}
            <form className="px-8 py-8 space-y-6">
              {/* STEP 1 */}
              {step === 1 && (
                <div className="space-y-6 animate-fadeIn">
                  <h2 className="text-2xl font-bold text-white mb-8">
                    Personal Details
                  </h2>

                  <div>
                    <label className="block text-sm font-semibold text-blue-300 mb-3">
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="your@email.com"
                      className="w-full px-4 py-3 bg-slate-800 border border-blue-500/30 text-white placeholder-gray-500 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-blue-300 mb-3">
                        First Name
                      </label>
                      <input
                        type="text"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        placeholder="John"
                        className="w-full px-4 py-3 bg-slate-800 border border-blue-500/30 text-white placeholder-gray-500 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-blue-300 mb-3">
                        Last Name
                      </label>
                      <input
                        type="text"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        placeholder="Doe"
                        className="w-full px-4 py-3 bg-slate-800 border border-blue-500/30 text-white placeholder-gray-500 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-blue-300 mb-3">
                        Current Weight (kg)
                      </label>
                      <input
                        type="number"
                        value={currentWeight}
                        onChange={(e) => setCurrentWeight(e.target.value)}
                        placeholder="85"
                        className="w-full px-4 py-3 bg-slate-800 border border-blue-500/30 text-white placeholder-gray-500 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-blue-300 mb-3">
                        Goal Weight (kg)
                      </label>
                      <input
                        type="number"
                        value={goalWeight}
                        onChange={(e) => setGoalWeight(e.target.value)}
                        placeholder="75"
                        className="w-full px-4 py-3 bg-slate-800 border border-blue-500/30 text-white placeholder-gray-500 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                        required
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    onClick={handleSaveDetails}
                    disabled={loading}
                    className="w-full mt-8 py-3 bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-bold rounded-lg hover:shadow-lg hover:shadow-blue-500/50 transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? "Saving..." : "Continue to Goals"}
                  </button>
                </div>
              )}

              {/* STEP 2 */}
              {step === 2 && (
                <div className="space-y-6 animate-fadeIn">
                  <h2 className="text-2xl font-bold text-white mb-8">
                    What's Your Fitness Goal?
                  </h2>

                  <div className="space-y-3">
                    {[
                      {
                        value: "weight_loss",
                        label: "Weight Loss",
                        emoji: "⬇️",
                        desc: "Reduce body weight",
                      },
                      {
                        value: "muscle_gain",
                        label: "Muscle Gain",
                        emoji: "💪",
                        desc: "Build lean muscle",
                      },
                      {
                        value: "maintenance",
                        label: "Maintenance",
                        emoji: "⚖️",
                        desc: "Keep current fitness",
                      },
                      {
                        value: "strength",
                        label: "Strength",
                        emoji: "🔥",
                        desc: "Increase power & endurance",
                      },
                    ].map((option) => (
                      <label
                        key={option.value}
                        className={`flex items-center p-4 rounded-xl cursor-pointer transition border-2 ${
                          fitnessGoal === option.value
                            ? "border-blue-500 bg-blue-500/10"
                            : "border-blue-500/20 bg-slate-800/50 hover:border-blue-500/50"
                        }`}
                      >
                        <input
                          type="radio"
                          value={option.value}
                          checked={fitnessGoal === option.value}
                          onChange={(e) => setFitnessGoal(e.target.value)}
                          className="w-5 h-5 text-blue-500"
                        />
                        <span className="text-2xl ml-4">{option.emoji}</span>
                        <div className="ml-3">
                          <p className="text-white font-semibold">
                            {option.label}
                          </p>
                          <p className="text-xs text-gray-400">
                            {option.desc}
                          </p>
                        </div>
                      </label>
                    ))}
                  </div>

                  <div className="flex gap-3 pt-4">
                    <button
                      type="button"
                      onClick={handlePreviousStep}
                      className="flex-1 py-3 border border-blue-500/30 text-blue-400 font-semibold rounded-lg hover:bg-slate-800/50 transition"
                    >
                      ← Back
                    </button>
                    <button
                      type="submit"
                      onClick={handleGoalsAndPayment}
                      disabled={loading}
                      className="flex-1 py-3 bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-semibold rounded-lg hover:shadow-lg hover:shadow-blue-500/50 transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loading ? "Processing..." : "Choose Plan →"}
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 3 */}
              {step === 3 && (
                <div className="space-y-6 animate-fadeIn">
                  <h2 className="text-2xl font-bold text-white mb-8">
                    Select Your Plan
                  </h2>

                  <div className="space-y-3">
                    {Object.entries(planAmounts).map(([planKey]) => (
                      <label
                        key={planKey}
                        className={`flex items-center p-5 rounded-xl cursor-pointer transition border-2 ${
                          plan === planKey
                            ? "border-cyan-500 bg-cyan-500/10"
                            : "border-blue-500/20 bg-slate-800/50 hover:border-blue-500/50"
                        }`}
                      >
                        <input
                          type="radio"
                          value={planKey}
                          checked={plan === planKey}
                          onChange={(e) => setPlan(e.target.value)}
                          className="w-5 h-5 text-cyan-500"
                        />
                        <div className="ml-4 flex-1">
                          <p className="font-semibold text-white text-lg">
                            {planKey.replace("_", " ").toUpperCase()}
                          </p>
                          <p className="text-xs text-gray-400">
                            {planKey === "1_month"
                              ? "1 month access"
                              : planKey === "3_months"
                              ? "3 months access"
                              : "6 months access"}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold text-cyan-400">
                            {planPrices[planKey]}
                          </p>
                        </div>
                      </label>
                    ))}
                  </div>

                  <div className="bg-blue-500/10 p-4 rounded-xl border border-blue-500/20 mt-6">
                    <p className="text-sm text-blue-300">
                      <span className="font-semibold">ℹ️ Note:</span> Your
                      trainer will send you a password after payment
                      confirmation.
                    </p>
                  </div>

                  <div className="flex gap-3 pt-4">
                    <button
                      type="button"
                      onClick={handlePreviousStep}
                      className="flex-1 py-3 border border-blue-500/30 text-blue-400 font-semibold rounded-lg hover:bg-slate-800/50 transition"
                    >
                      ← Back
                    </button>
                    <button
                      type="submit"
                      onClick={handlePayment}
                      disabled={paymentProcessing}
                      className="flex-1 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold rounded-lg hover:shadow-lg hover:shadow-cyan-500/50 transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {paymentProcessing ? "Processing..." : "Pay Now →"}
                    </button>
                  </div>
                </div>
              )}
            </form>
          </div>
        )}
      </div>

      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-in-out;
        }

        @keyframes blob {
          0%, 100% {
            transform: translate(0, 0) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  );
}
