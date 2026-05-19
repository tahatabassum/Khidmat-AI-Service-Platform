# Khidmat App Features

## Previous Features
- **Authentication:** Secure login/signup for users and service providers (Providers).
- **AI Matching:** Matches user requests with the best providers via AI.
- **AI Traces:** Shows the user *why* a specific provider was recommended.
- **Service Booking:** Simple UI to book providers for specific slots and view booking history.
- **Dispute Resolution:** Built-in dispute reporting system.
- **Maps Integration:** Provider maps and Google Maps deep linking for navigation.
- **Auto-Location:** Automatically fetches user's GPS address for checkout.
- **Provider Dashboard:** A hub for providers to see metrics, upcoming jobs, and earnings.
- **Notifications:** Alerts for booking updates and messages.
- **UI Optimizations:** Component caching for lower-end devices and light/dark themes.

## New Features (Hackathon Ready)
- **Live Global Chat:** Ready for WebSockets over cloud deployment.
- **Official Gemini API:** Migrated to Google's official `google-genai` SDK (`gemini-2.5-flash`) for faster, more reliable AI outputs.
- **Multimodal Image Analysis:** Users can upload/snap photos of issues (e.g. broken AC). Gemini visually analyzes the photo to automatically detect the service needed without typing.
- **Two-Way Rating System:** Dynamic 1-5 star rating modal allowing users to rate providers. Ratings automatically update the provider's total score in the database.
- **Android Keyboard Fix:** Solved the software keyboard covering the chat input on Android devices.
- **Dual Profile System:** Seamlessly allows a single account to act as both a Customer and a Provider, similar to Airbnb or Fiverr, making it easy to switch contexts and boosting platform retention.
- **Pakistan-Wide Coverage (60+ Cities):** Expanded the provider registration to list 60+ major cities of Pakistan alphabetically, ensuring providers all over the country can easily register.
- **GPS-Based Registration Auto-Fill:** Integrated `expo-location` on the registration page, allowing providers to auto-fill their current street/area name and automatically select their matching city chip with a single tap.

