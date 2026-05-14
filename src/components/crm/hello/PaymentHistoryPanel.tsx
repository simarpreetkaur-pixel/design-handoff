import React, { useState } from "react"
import { ArrowLeft, ChevronDown, CheckCircle, AlertCircle, Clock, Car, Heart, Shield, CreditCard } from "lucide-react"
import { cn } from "@/lib/utils"

interface Customer {
  id: string
  name: string
  phone: string
  email: string
}

interface Policy {
  id: string
  number: string
  type: string
  vehicleMake?: string
  vehicleModel?: string
}

interface PaymentEntry {
  id: string
  transactionId: string
  amount: number
  currency: string
  paymentDate: string
  paymentMethod: "UPI" | "Card" | "Net Banking" | "Wallet"
  status: "Success" | "Pending" | "Failed"
  source: "Central" | "Auto" | "Embedded"
  policyNumber?: string
  policyType: "auto" | "health" | "life"
  paymentGateway: string
  
  // Detailed information (shown on expand)
  details: {
    initiatedOn: string
    bankName?: string
    upiApp?: string
    upiId?: string
    cardLast4?: string
    paymentSubMethod?: string
    gatewayTransactionId?: string
    failureReason?: string
    refundAmount?: number
    refundStatus?: string
  }
}

interface PaymentHistoryPanelProps {
  customer?: Customer
  customerPolicies?: Policy[]
  onBack: () => void
}

// Mock payment data for Rajesh Kumar
const mockPaymentHistory: PaymentEntry[] = [
  {
    id: "pay_001",
    transactionId: "mozmhng22FYXYTNFW24J",
    amount: 1000,
    currency: "INR",
    paymentDate: "01 May 2026 7:54 AM",
    paymentMethod: "UPI",
    status: "Success",
    source: "Central",
    policyNumber: "DBCR10468610009/02",
    policyType: "auto",
    paymentGateway: "RAZORPAY",
    details: {
      initiatedOn: "01 May 2026 7:54 AM",
      upiApp: "PhonePe",
      upiId: "rajesh-1@okicici",
      paymentSubMethod: "UPI Intent",
      gatewayTransactionId: "Acko_tech-momahmg22FYXYTNFW24J-1"
    }
  },
  {
    id: "pay_002", 
    transactionId: "molciToGCrJRESXCSQ",
    amount: 2890,
    currency: "INR",
    paymentDate: "30 Apr 2026 4:05 PM",
    paymentMethod: "UPI",
    status: "Pending",
    source: "Auto",
    policyNumber: "ACCR10468614939/02",
    policyType: "auto",
    paymentGateway: "JUSTPAY",
    details: {
      initiatedOn: "30 Apr 2026 4:05 PM",
      upiApp: "Google Pay",
      upiId: "rajesh-2@paytm",
      paymentSubMethod: "UPI Collect"
    }
  },
  {
    id: "pay_003",
    transactionId: "mnijlqqeAElTHIBLLJSE",
    amount: 500,
    currency: "INR", 
    paymentDate: "04 Apr 2026 4:38 AM",
    paymentMethod: "UPI",
    status: "Success",
    source: "Central",
    policyNumber: "ACK-HL-2024-88421",
    policyType: "health",
    paymentGateway: "RAZORPAY",
    details: {
      initiatedOn: "04 Apr 2026 4:38 AM",
      upiApp: "Paytm",
      upiId: "rajesh-3@ybl",
      paymentSubMethod: "UPI Intent",
      gatewayTransactionId: "Acko_tech-mnijlqqe45HIBLLJ-2"
    }
  },
  {
    id: "pay_004",
    transactionId: "mk8hwab5B2JD4T7SEB35",
    amount: 1958.24,
    currency: "INR",
    paymentDate: "10 Jan 2026 6:46 PM", 
    paymentMethod: "Card",
    status: "Failed",
    source: "Embedded",
    policyNumber: "DBCR10468610009/02",
    policyType: "auto",
    paymentGateway: "JUSTPAY",
    details: {
      initiatedOn: "10 Jan 2026 6:46 PM",
      cardLast4: "9003",
      paymentSubMethod: "Debit Card",
      bankName: "HDFC Bank",
      failureReason: "Insufficient balance"
    }
  },
  {
    id: "pay_005",
    transactionId: "mkBbIyqfUUUQNG39TXQA",
    amount: 1958.24,
    currency: "INR",
    paymentDate: "10 Jan 2026 6:44 PM",
    paymentMethod: "Net Banking",
    status: "Success", 
    source: "Embedded",
    policyNumber: "DBCR10468610009/02",
    policyType: "auto",
    paymentGateway: "RAZORPAY",
    details: {
      initiatedOn: "10 Jan 2026 6:44 PM",
      bankName: "ICICI Bank",
      paymentSubMethod: "Net Banking",
      gatewayTransactionId: "pay_tech-mkBbIyqf99QNG39TX-3"
    }
  }
]

export function PaymentHistoryPanel({ customer, customerPolicies = [], onBack }: PaymentHistoryPanelProps) {
  const [expandedPayment, setExpandedPayment] = useState<string | null>(null)
  const [selectedFilter, setSelectedFilter] = useState<"all" | "auto" | "health" | "life">("all")

  const toggleExpandedPayment = (paymentId: string) => {
    setExpandedPayment(expandedPayment === paymentId ? null : paymentId)
  }

  // Payment method configuration
  const paymentMethodConfig = {
    UPI: {
      label: "UPI"
    },
    Card: {
      label: "Card"
    },
    "Net Banking": {
      label: "Net Banking"
    },
    Wallet: {
      label: "Wallet"
    }
  }

  // Status configuration
  const statusConfig = {
    Success: { icon: CheckCircle, label: "Success", color: "text-green-600", bgColor: "bg-green-50" },
    Pending: { icon: Clock, label: "Pending", color: "text-orange-600", bgColor: "bg-orange-50" },
    Failed: { icon: AlertCircle, label: "Failed", color: "text-red-600", bgColor: "bg-red-50" }
  }

  const formatAmount = (amount: number, currency: string = "INR") => {
    return `₹${amount.toLocaleString('en-IN')}`
  }

  // Policy type filters
  const policyTypeFilters = [
    { id: "all", label: "All Policies", icon: Shield },
    { id: "auto", label: "Auto", icon: Car },
    { id: "health", label: "Health", icon: Heart },
    { id: "life", label: "Life", icon: Shield }
  ]

  // Filter payments based on selected policy type
  const filteredPayments = mockPaymentHistory.filter(payment => {
    if (selectedFilter === "all") return true
    return payment.policyType === selectedFilter
  })

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="flex items-center justify-center w-8 h-8 rounded-lg border border-[#e7e7f0] bg-white hover:bg-[#fafafa] transition-colors"
          >
            <ArrowLeft className="w-4 h-4 text-[#5b5675]" />
          </button>
          <div>
            <h3 className="font-euclid text-lg font-semibold text-[#040222]">Payment History</h3>
          </div>
        </div>
      </div>

      {/* Policy Type Filters */}
      <div className="mb-4">
        <div className="flex gap-1 overflow-x-auto">
          {policyTypeFilters.map((filter) => {
            const isActive = selectedFilter === filter.id
            const IconComponent = filter.icon
            
            return (
              <button
                key={filter.id}
                onClick={() => setSelectedFilter(filter.id as any)}
                className={cn(
                  "flex items-center gap-1.5 px-2 py-1.5 rounded-md text-xs font-medium transition-colors whitespace-nowrap",
                  isActive 
                    ? "bg-[#7c47e1] text-white" 
                    : "bg-[#f8f7fc] text-[#5b5675] hover:bg-[#f0f0f6]"
                )}
              >
                <IconComponent className="h-3 w-3" />
                <span>{filter.label}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Payment Timeline */}
      <div className="space-y-3">
        {filteredPayments.map((payment, index) => {
          const paymentMethodInfo = paymentMethodConfig[payment.paymentMethod]
          const statusInfo = statusConfig[payment.status]
          const isExpanded = expandedPayment === payment.id
          const StatusIcon = statusInfo.icon

          return (
            <div
              key={payment.id}
              className="border border-[#e7e7f0] rounded-lg bg-white"
            >
              {/* Main Payment Entry */}
              <div className="p-5">
                {/* Top Row: Amount and Status */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <span className="font-euclid text-lg font-semibold text-[#040222]">
                      {formatAmount(payment.amount)}
                    </span>
                    <div className={cn(
                      "flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-medium",
                      statusInfo.bgColor,
                      statusInfo.color
                    )}>
                      <StatusIcon className="h-3 w-3" />
                      <span>{statusInfo.label}</span>
                    </div>
                  </div>
                  
                  <button
                    onClick={() => toggleExpandedPayment(payment.id)}
                    className="flex items-center gap-1 text-xs text-[#7c47e1] hover:text-[#6a3cc7] font-medium transition-colors"
                  >
                    <span>view details</span>
                    <ChevronDown className={cn(
                      "h-3 w-3 transition-transform duration-200",
                      isExpanded && "rotate-180"
                    )} />
                  </button>
                </div>

                {/* Date Row */}
                <div className="mb-2">
                  <span className="text-xs text-[#5b5675]">{payment.paymentDate}</span>
                </div>

                {/* Payment Method Details Row */}
                <div className="flex items-center gap-2 text-sm">
                  <span className="font-medium text-[#040222]">{payment.paymentGateway}</span>
                  <span className="text-[#5b5675]">•</span>
                  <span className="text-[#5b5675]">
                    {payment.paymentMethod === "UPI" && payment.details.upiId 
                      ? `UPI (${payment.details.upiId})`
                      : payment.paymentMethod === "Card" && payment.details.cardLast4
                      ? `Card (****${payment.details.cardLast4})`
                      : paymentMethodInfo.label
                    }
                  </span>
                </div>

                {/* Expanded Details */}
                {isExpanded && (
                  <div className="mt-4 pt-4 border-t border-[#e7e7f0]">
                    <div className="space-y-4">
                      
                      {/* Basic Transaction Info */}
                      <div>
                        <h6 className="font-euclid text-sm font-medium text-[#040222] mb-3">
                          Transaction Details
                        </h6>
                        <div className="bg-[#f8f7fc] rounded-lg p-3 space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="text-[#5b5675] text-sm">Transaction ID</span>
                            <span className="font-euclid text-[#040222] font-medium text-sm font-mono">{payment.transactionId}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-[#5b5675] text-sm">Policy Number</span>
                            <span className="font-euclid text-[#040222] font-medium text-sm">{payment.policyNumber}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-[#5b5675] text-sm">Initiated On</span>
                            <span className="font-euclid text-[#040222] font-medium text-sm">{payment.details.initiatedOn}</span>
                          </div>
                        </div>
                      </div>

                      {/* Payment Method Details */}
                      <div>
                        <h6 className="font-euclid text-sm font-semibold text-[#040222] mb-3">
                          Payment Method Details
                        </h6>
                        <div className="bg-[#f8f7fc] rounded-lg p-3 space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="text-[#5b5675] text-sm">Payment Gateway</span>
                            <span className="font-euclid text-[#040222] font-medium text-sm">{payment.paymentGateway}</span>
                          </div>
                          {payment.details.paymentSubMethod && (
                            <div className="flex justify-between items-center">
                              <span className="text-[#5b5675] text-sm">Sub Method</span>
                              <span className="font-euclid text-[#040222] font-medium text-sm">{payment.details.paymentSubMethod}</span>
                            </div>
                          )}
                          <div className="flex justify-between items-center">
                            <span className="text-[#5b5675] text-sm">Source</span>
                            <span className="font-euclid text-[#040222] font-medium text-sm">{payment.source}</span>
                          </div>
                        </div>
                      </div>

                      {/* Gateway Information */}
                      {payment.details.gatewayTransactionId && (
                        <div>
                          <h6 className="font-euclid text-sm font-medium text-[#040222] mb-3">
                            Gateway Information
                          </h6>
                          <div className="bg-[#f8f7fc] rounded-lg p-3">
                            <div className="flex justify-between items-center">
                              <span className="text-[#5b5675] text-sm">Gateway Transaction ID</span>
                              <span className="font-euclid text-[#040222] font-medium text-xs font-mono">{payment.details.gatewayTransactionId}</span>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Failure Information */}
                      {payment.details.failureReason && (
                        <div>
                          <h6 className="font-euclid text-sm font-semibold text-red-600 mb-3">
                            Failure Details
                          </h6>
                          <div className="bg-red-50 rounded-lg p-3">
                            <div className="flex justify-between items-center">
                              <span className="text-red-700 text-sm">Failure Reason</span>
                              <span className="font-euclid text-red-800 font-medium text-sm">{payment.details.failureReason}</span>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Refund Information */}
                      {payment.details.refundAmount && (
                        <div>
                          <h6 className="font-euclid text-sm font-semibold text-[#040222] mb-3">
                            Refund Details
                          </h6>
                          <div className="bg-[#f8f7fc] rounded-lg p-3 space-y-2">
                            <div className="flex justify-between items-center">
                              <span className="text-[#5b5675] text-sm">Refund Amount</span>
                              <span className="font-euclid text-[#040222] font-medium text-sm">{formatAmount(payment.details.refundAmount)}</span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-[#5b5675] text-sm">Refund Status</span>
                              <span className="font-euclid text-[#040222] font-medium text-sm">{payment.details.refundStatus}</span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Empty State */}
      {filteredPayments.length === 0 && (
        <div className="text-center py-8">
          <div className="w-12 h-12 bg-[#f8f7fc] rounded-lg flex items-center justify-center mx-auto mb-3">
            <CreditCard className="w-6 h-6 text-[#5b5675]" />
          </div>
          <p className="font-euclid text-sm text-[#5b5675]">
            No payment history found
          </p>
        </div>
      )}
    </div>
  )
}