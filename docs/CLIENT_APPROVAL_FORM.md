# Client Production Launch Approval Form (Phase 4D)

**Project:** Kiran's Infotech Digital Storefront & Operations Platform  
**Prepared By:** Engineering Team  
**Date:** 2026-11-18

---

## 1. Commercial Decisions Requiring Sign-Off

| Item | Proposed Choice | Monthly Estimate (INR, incl. ~18% GST) | Client Decision |
| --- | --- | --- | --- |
| **Hosting Architecture** | Option A: Vercel Pro + Render Starter + Neon Launch *(Fallback: Railway Pro)* | ~₹3,210–₹3,710/mo *(Fallback: ~₹1,505–₹2,510/mo)* | [ ] Approve Primary / [ ] Approve Fallback |
| **Purchase Mode** | `ORDER_REQUEST_ONLY` (offline/pay-at-store confirmation) | ₹0 gateway fee | [ ] Confirmed |
| **Online Payments (Razorpay)** | Disabled at launch (`ONLINE_PAYMENT_ENABLED=false`) | N/A until Phase 5 | [ ] Keep Disabled / [ ] Request Later |
| **Transactional Email** | Resend / SMTP (free tier -> paid as volume grows) | ₹0 starter | [ ] Enable / [ ] Keep Sandbox |
| **WhatsApp Notifications** | Meta WhatsApp Cloud API (per-conversation Meta fees) | Pay-as-you-go | [ ] Enable / [ ] Keep Sandbox |

## 2. Authorization

By signing below, the client authorizes provisioning the approved hosting tier, binding the custom domain, importing verified business catalog data (`isDemo=false`), and enabling the selected live integrations.

- **Client Name & Designation:** \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_
- **Signature & Date:** \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_
