"use client"
import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { LogOut, Shield, Bell, Plus, Trash2, UserCircle } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { useAuth } from "@/lib/hooks/useAuth"
import { LoadingSpinner } from "@/components/shared/LoadingSpinner"
import { BrainIllustration } from "@/components/illustrations/BrainIllustration"
import { api } from "@/lib/api"
import type { EmergencyContact } from "@/lib/types"

const addSchema = z.object({
  email: z.string().email("Invalid email"),
  name: z.string().optional(),
})
type AddFormData = z.infer<typeof addSchema>

async function signOut() {
  await fetch("/api/auth/clear-token", { method: "POST" })
  window.location.href = "/"
}

const inputCls = "w-full rounded-xl border border-warm-border bg-warm-950 px-4 py-3 text-sm text-[#1C1410] placeholder-gray-warm/50 outline-none transition-all focus:border-[#E85D04] focus:ring-2 focus:ring-[#E85D04]/10"

export default function ProfilePage() {
  const { user, loading } = useAuth()
  const [contacts, setContacts] = useState<EmergencyContact[]>([])
  const [contactsLoading, setContactsLoading] = useState(true)
  const [addError, setAddError] = useState("")
  const [removingId, setRemovingId] = useState<string | null>(null)

  const { register, handleSubmit, reset: resetForm, formState: { errors, isSubmitting } } = useForm<AddFormData>({
    resolver: zodResolver(addSchema),
  })

  useEffect(() => {
    api.auth.emergencyContacts()
      .then(setContacts)
      .catch(() => {})
      .finally(() => setContactsLoading(false))
  }, [])

  async function onAddContact(data: AddFormData) {
    setAddError("")
    try {
      const contact = await api.auth.addEmergencyContact({ email: data.email, name: data.name || undefined })
      setContacts((prev) => [...prev, contact])
      resetForm()
    } catch (e) {
      setAddError(e instanceof Error ? e.message : "Failed to add contact")
    }
  }

  async function onRemoveContact(id: string) {
    setRemovingId(id)
    try {
      await api.auth.removeEmergencyContact(id)
      setContacts((prev) => prev.filter((c) => c.id !== id))
    } catch {
      // leave in list on failure
    } finally {
      setRemovingId(null)
    }
  }

  if (loading) return (
    <div className="flex justify-center items-center pt-32"><LoadingSpinner /></div>
  )

  const initials = user?.name?.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    ?? user?.email?.[0].toUpperCase() ?? "?"

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div>
        <h1 className="font-playfair text-4xl font-bold text-[#1C1410]">Profile</h1>
        <p className="mt-1 text-gray-warm">Account settings & emergency contacts</p>
      </div>

      {/* User card */}
      <div className="rounded-card-lg bg-white border-glow-electric p-6 shadow-elevated relative overflow-hidden">
        <div className="absolute bottom-0 right-0 opacity-[0.055] pointer-events-none translate-x-4 translate-y-4">
          <BrainIllustration size={140} animate={false} />
        </div>
        <div className="absolute top-0 right-0 w-40 h-40 rounded-full bg-[#E85D04]/04 blur-2xl" />

        <div className="flex items-center gap-5 relative z-10">
          <div className="relative flex-shrink-0">
            <motion.div
              className="h-[72px] w-[72px] rounded-full p-[2.5px]"
              animate={{ rotate: 360 }}
              transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
              style={{ background: "conic-gradient(from 0deg, #E85D04, #D97706, #FED7AA, #E85D04)" }}
            >
              <div className="h-full w-full rounded-full bg-white flex items-center justify-center">
                <div className="flex h-full w-full items-center justify-center rounded-full bg-gradient-to-br from-[#E85D04] to-[#C2410C]">
                  <span className="font-playfair text-xl font-bold text-white">{initials}</span>
                </div>
              </div>
            </motion.div>
            <div className="absolute -bottom-0.5 -right-0.5 h-4 w-4 rounded-full bg-emerald-500 border-2 border-white animate-live shadow-sm" />
          </div>

          <div>
            <p className="font-playfair text-xl font-bold text-[#1C1410]">{user?.name ?? ""}</p>
            <p className="text-sm text-gray-warm">{user?.email}</p>
            <div className="mt-2 flex items-center gap-1.5">
              <Shield className="h-3 w-3 text-emerald-600" />
              <p className="text-xs text-emerald-700 font-semibold">Account secured · 2FA active</p>
            </div>
          </div>
        </div>

        <div className="mt-5 pt-4 border-t border-warm-border grid grid-cols-3 gap-4 relative z-10">
          {[
            { label: "Auth", value: "JWT + 2FA", color: "#059669" },
            { label: "Provider", value: user?.email?.includes("google") ? "Google" : "Email", color: "#E85D04" },
            { label: "Status", value: "Active", color: "#059669" },
          ].map(({ label, value, color }) => (
            <div key={label} className="text-center">
              <p className="text-[9px] font-bold uppercase tracking-widest text-gray-warm mb-0.5">{label}</p>
              <p className="text-xs font-semibold" style={{ color }}>{value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Emergency contacts */}
      <div className="rounded-card-lg bg-white border border-warm-border p-6 shadow-card space-y-5">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-violet-50 border border-violet-200 flex items-center justify-center">
            <Bell className="h-4 w-4 text-[#7C3AED]" />
          </div>
          <div>
            <h2 className="font-playfair text-xl font-bold text-[#1C1410]">Emergency Contacts</h2>
            <p className="text-xs text-gray-warm">All contacts are alerted when a stroke risk is detected</p>
          </div>
        </div>

        {/* Contact list */}
        {contactsLoading ? (
          <div className="flex justify-center py-4"><LoadingSpinner /></div>
        ) : (
          <div className="space-y-2">
            <AnimatePresence>
              {contacts.map((contact) => (
                <motion.div
                  key={contact.id}
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="flex items-center gap-3 rounded-xl border border-warm-border bg-warm-950 px-4 py-3"
                >
                  <div className="h-8 w-8 rounded-full bg-violet-50 border border-violet-200 flex items-center justify-center flex-shrink-0">
                    <UserCircle className="h-4 w-4 text-[#7C3AED]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    {contact.name && (
                      <p className="text-sm font-semibold text-[#1C1410] truncate">{contact.name}</p>
                    )}
                    <p className="text-xs text-gray-warm truncate">{contact.email}</p>
                  </div>
                  <button
                    onClick={() => onRemoveContact(contact.id)}
                    disabled={removingId === contact.id}
                    className="flex-shrink-0 rounded-lg p-1.5 text-gray-warm hover:text-red-600 hover:bg-red-50 transition-colors disabled:opacity-40"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </motion.div>
              ))}
            </AnimatePresence>

            {contacts.length === 0 && (
              <p className="text-sm text-gray-warm text-center py-3">No emergency contacts yet</p>
            )}
          </div>
        )}

        {/* Add contact form */}
        <form onSubmit={handleSubmit(onAddContact)} className="space-y-3 pt-1 border-t border-warm-border">
          <p className="text-xs font-bold uppercase tracking-wide text-gray-warm pt-1">Add a contact</p>
          <div className="flex gap-2">
            <div className="flex-1">
              <input
                {...register("name")}
                type="text"
                placeholder="Name (optional)"
                className={inputCls}
              />
            </div>
            <div className="flex-[2]">
              <input
                {...register("email")}
                type="email"
                placeholder="Email address"
                className={inputCls}
              />
            </div>
          </div>
          {errors.email && (
            <p className="text-xs text-red-600">{errors.email.message}</p>
          )}
          {addError && (
            <p className="text-xs text-red-600">{addError}</p>
          )}
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex items-center gap-2 rounded-full bg-gradient-to-r from-[#E85D04] to-[#C2410C] px-5 py-2 text-sm font-semibold text-white shadow-sm hover:shadow-glow transition-all hover:-translate-y-0.5 disabled:opacity-50"
          >
            <Plus className="h-4 w-4" />
            {isSubmitting ? "Adding…" : "Add contact"}
          </button>
        </form>
      </div>

      {/* Security info */}
      <div className="rounded-card bg-white border border-warm-border p-5 shadow-card">
        <div className="flex items-center gap-3 mb-3">
          <div className="h-8 w-8 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-center">
            <Shield className="h-4 w-4 text-emerald-600" />
          </div>
          <h3 className="font-playfair text-base font-bold text-[#1C1410]">Security</h3>
        </div>
        <div className="space-y-2">
          {[
            "Two-factor authentication active",
            "JWT tokens expire after 60 minutes",
            "All data encrypted in transit",
          ].map((item) => (
            <div key={item} className="flex items-center gap-2">
              <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 flex-shrink-0" />
              <p className="text-xs text-gray-warm">{item}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Sign out */}
      <button onClick={signOut}
        className="flex items-center gap-2 rounded-full border border-red-200 bg-red-50 px-6 py-2.5 text-sm font-semibold text-red-700 transition-all hover:bg-red-100 hover:-translate-y-0.5">
        <LogOut className="h-4 w-4" /> Sign out
      </button>

      <p className="text-xs text-gray-warm text-center pb-4">
        Sentinel v1.0 · Your health data is encrypted and never sold
      </p>
    </motion.div>
  )
}
