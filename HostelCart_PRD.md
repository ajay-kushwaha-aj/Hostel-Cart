# HostelCart --- Product Requirements Document (PRD)

**Document version:** 1.0\
**Status:** MVP specification\
**Product type:** Mobile-first web application\
**Initial audience:** Students living in one hostel\
**Initial platforms:** Blinkit, Zepto, Swiggy Instamart\
**Suggested stack:** React + Vite + TypeScript + Tailwind CSS +
Firebase + Vercel

------------------------------------------------------------------------

## 1. Executive Summary

HostelCart is a hostel-focused group-order coordination web application.
It helps students combine their shopping requirements for quick-commerce
platforms so that a group can reach an applicable minimum cart value
without any student buying unnecessary products.

Students can create a shared order, invite hostel-mates, add products
manually or by pasting product links, see a live combined cart total,
track the minimum threshold, and coordinate individual payments outside
HostelCart.

HostelCart does **not** place orders on Blinkit, Zepto, or Swiggy
Instamart. It does not hold, collect, or transfer money. The organizer
completes checkout independently in the selected third-party app.

### Product tagline

**Shop Together. Save Together. No Unnecessary Items.**

### Core value proposition

Instead of adding unwanted products to reach a minimum order value,
students can combine the items they genuinely need with other students
in their hostel.

------------------------------------------------------------------------

## 2. Problem Statement

Students living in hostels frequently make small quick-commerce
purchases. Depending on the platform, location, time, account, and
offer, an order may have a minimum cart value or delivery fee condition.

For example:

  Student                        Items subtotal
  ---------------------------- ----------------
  Student A                                 ₹85
  Student B                                 ₹65
  Student C                                 ₹75
  **Combined item subtotal**           **₹225**

If the applicable minimum item subtotal is ₹199, the group may meet it
together. Actual eligibility and fees must always be checked in the
third-party app at checkout.

Current coordination is inconvenient because: - Students do not know who
else wants to order from the same platform. - Shopping lists are
scattered across WhatsApp messages. - It is difficult to calculate each
student's share. - Product availability and prices can change. - There
is no shared view of the group's progress. - The organizer needs a clear
way to freeze the cart and coordinate checkout.

------------------------------------------------------------------------

## 3. Product Goals

1.  Help hostel students combine genuine shopping requirements.
2.  Reduce unnecessary purchases made only to reach a threshold.
3.  Make creating and joining a group order quick and simple.
4.  Provide accurate live totals and participant-level subtotals.
5.  Make checkout coordination and payment acknowledgements transparent.
6.  Validate the product with one hostel before expanding to other
    hostels.

### Success metrics

Track: - Number of group orders created. - Percentage of group orders
reaching their configured threshold. - Average participants per group
order. - Average time from order creation to threshold reached. - Repeat
usage by students. - Number of cancelled or expired sessions. -
User-reported unnecessary purchases avoided.

Do not claim guaranteed savings or guaranteed free delivery. These
depend on third-party platform checkout conditions.

------------------------------------------------------------------------

## 4. Target Users and Roles

### 4.1 Student / Participant

A registered hostel student who can: - View eligible group orders in
their hostel. - Join an open group order. - Add, edit, and remove their
own items while the order is open. - Add an item manually or with a
product URL. - See the group total and their own subtotal. - View the
final contribution summary. - Acknowledge that they have paid the
organizer, if enabled by the workflow.

### 4.2 Organizer

An organizer is also a participant, with additional permissions: -
Create a group order. - Choose the quick-commerce platform. - Set the
minimum item subtotal and expiry time. - Share the invitation
link/code. - View all participants and items. - Lock or unlock the
cart. - Coordinate external payments. - Enter the actual checkout total
and any adjustments. - Mark the order as placed, completed, cancelled,
or expired.

### 4.3 Admin

For the initial pilot, admin functionality can be minimal: - Manage
hostel records and invite codes. - View and deactivate reported users. -
Review reports. - View basic usage metrics. - Manage platform
availability labels and app configuration.

Do not expose admin permissions to normal users. Admin authorization
must be enforced server-side and in Firestore Security Rules.

------------------------------------------------------------------------

## 5. MVP Scope

### 5.1 Must-have features

  -----------------------------------------------------------------------
  ID                      Feature                 Requirement
  ----------------------- ----------------------- -----------------------
  FR-01                   Authentication          Users can register and
                                                  sign in securely.

  FR-02                   Hostel onboarding       Users join the pilot
                                                  hostel using an invite
                                                  code or approved
                                                  invitation.

  FR-03                   Create group order      Organizer creates a
                                                  group order.

  FR-04                   Platform selection      Choose Blinkit, Zepto,
                                                  or Swiggy Instamart.

  FR-05                   Minimum threshold       Organizer enters the
                                                  applicable minimum item
                                                  subtotal in INR.

  FR-06                   Manual item entry       Add product name,
                                                  quantity, and unit
                                                  price.

  FR-07                   Product URL entry       Save product URL and
                                                  manually confirmed
                                                  product name and price.

  FR-08                   Join order              Join using a shareable
                                                  link or code.

  FR-09                   Live group cart         Participants see
                                                  updates in real time.

  FR-10                   Individual subtotal     Each participant sees
                                                  their own item
                                                  subtotal.

  FR-11                   Threshold progress      Show total, threshold,
                                                  remaining amount, and
                                                  threshold status.

  FR-12                   Order lifecycle         Support defined order
                                                  statuses.

  FR-13                   Payment acknowledgement Track participant
                                                  payment status without
                                                  processing money.

  FR-14                   Final summary           Show items,
                                                  participants, actual
                                                  checkout total, and
                                                  allocations.

  FR-15                   Responsive design       Work well on Android
                                                  mobile browsers and
                                                  desktop.

  FR-16                   Security                Users can only edit
                                                  their own items;
                                                  organizers have defined
                                                  controls.
  -----------------------------------------------------------------------

### 5.2 Explicitly out of scope for MVP

Do not build these in the first version: - Automatic checkout or
ordering in third-party apps. - Scraping third-party websites or
bypassing access controls. - Automatic product price or availability
extraction. - Official platform cart synchronization. - Integrated UPI,
payment gateway, wallet, or escrow. - Holding or transferring user
money. - Delivery tracking. - Native Android or iOS apps. - AI product
matching. - Multi-university discovery or public marketplace. - Complex
loyalty, referral, or coupon systems.

The architecture should not assume that Blinkit, Zepto, or Swiggy
Instamart provide public APIs for cart creation or checkout.

------------------------------------------------------------------------

## 6. Supported Platforms

Store platform identifiers as stable values:

-   `blinkit`
-   `zepto`
-   `instamart`

Display names: - Blinkit - Zepto - Swiggy Instamart

A group order must belong to exactly one platform. Participants should
only join an order for the platform selected by its organizer.

The organizer enters the applicable minimum threshold manually. Do not
hardcode a universal minimum order value because requirements can vary
by location, account, time, and promotion.

------------------------------------------------------------------------

## 7. Main User Flows

### 7.1 Registration and hostel onboarding

1.  User opens HostelCart.
2.  User registers or signs in.
3.  User completes a basic profile.
4.  User enters the hostel invitation code.
5.  Backend validates the code and associates the user with the hostel.
6.  User lands on the hostel dashboard.

For the pilot, restrict access to the selected hostel. Avoid collecting
unnecessary personal information. Room number should be optional and
should not be publicly visible.

### 7.2 Create a group order

1.  Organizer selects **Create Group Order**.
2.  Enters an order title, e.g. "Sunday Grocery".
3.  Selects Blinkit, Zepto, or Swiggy Instamart.
4.  Enters the minimum item subtotal in rupees.
5.  Selects an expiry duration or date/time.
6.  Optionally sets a participant limit.
7.  Creates the order.
8.  Backend generates a unique, hard-to-guess invitation code.
9.  Organizer shares the invite link/code through WhatsApp or another
    channel.

Required fields: - Title. - Platform. - Minimum item subtotal. - Expiry
time.

Optional fields: - Participant limit. - Pickup/meeting note. -
Description.

### 7.3 Join a group order

1.  Student opens an invitation link or enters a code.
2.  App validates that the order exists, is open, not expired, and
    belongs to the same hostel.
3.  Student sees order title, platform, threshold, expiry, and current
    total.
4.  Student confirms joining.
5.  Participant record is created.
6.  Student can add their own items.

A user must not be able to join a locked, cancelled, completed, or
expired order.

### 7.4 Add a product manually

Fields: - Product name (required). - Quantity (required; positive
integer or supported decimal if needed). - Unit price in INR (required;
non-negative, with sensible upper limit). - Optional note/variant.

The app calculates: `itemSubtotalPaise = quantity × unitPricePaise`

For MVP, use integer paise and define quantity/price validation
carefully. If fractional quantities are not needed, use positive
integers only.

### 7.5 Add a product using a URL

1.  Student selects **Add product link**.
2.  Pastes a product URL.
3.  App validates the URL scheme and allowed platform domain.
4.  Student manually enters or confirms product name, quantity, and
    current displayed unit price.
5.  App saves the original URL and the manually confirmed details.

Do not promise automatic product information extraction. Product pages
may require authentication, block automated requests, or change
frequently. Do not fetch arbitrary URLs from the backend; protect
against SSRF and malicious links.

### 7.6 Live collaborative cart

All participants see: - Order title and selected platform. - Order
status. - Minimum item subtotal. - Current group item subtotal. -
Remaining amount to reach threshold. - Progress indicator. - Participant
list. - Item list grouped by participant. - Their own subtotal.

Use Firestore real-time listeners. The backend must remain the source of
truth for totals and status.

### 7.7 Lock and checkout coordination

1.  Organizer reviews the cart.
2.  Organizer warns participants that the cart is about to be locked.
3.  Organizer locks the order.
4.  No further item edits or additions are allowed.
5.  App displays participant subtotals and payment instructions.
6.  Students pay the organizer directly outside HostelCart.
7.  Payment acknowledgements are recorded.
8.  Organizer checks the real third-party app and completes checkout
    independently.
9.  Organizer enters the actual checkout total and any adjustments.
10. Organizer marks the order as placed.
11. After distribution, organizer marks it completed.

The app must clearly state that threshold reached does not guarantee
free delivery or final checkout eligibility.

------------------------------------------------------------------------

## 8. Order Lifecycle and State Machine

Use these statuses:

  -----------------------------------------------------------------------
  Status                  Meaning                 Who can set it
  ----------------------- ----------------------- -----------------------
  `OPEN`                  Participants can join   System on creation
                          and edit items.         

  `THRESHOLD_REACHED`     Current item subtotal   Backend derived state
                          meets or exceeds        
                          configured threshold.   

  `LOCKED`                Cart is frozen for      Organizer
                          checkout coordination.  

  `PAYMENT_PENDING`       Organizer is collecting Organizer
                          external payments.      

  `READY_FOR_CHECKOUT`    Organizer has completed Organizer
                          payment coordination    
                          and is ready to         
                          checkout.               

  `PLACED`                Organizer confirms      Organizer
                          order was placed in the 
                          third-party app.        

  `COMPLETED`             Items have been         Organizer
                          distributed and session 
                          closed.                 

  `CANCELLED`             Order was cancelled.    Organizer / authorized
                                                  admin

  `EXPIRED`               Expiry time passed      Backend scheduled
                          before completion.      process
  -----------------------------------------------------------------------

### State rules

-   A new order starts as `OPEN`.
-   Threshold status is derived from item subtotal and configured
    threshold. It must not be trusted from a client-supplied value.
-   If an item is removed and the total drops below the threshold, the
    UI must immediately show the shortfall. If the order is not locked,
    the derived threshold state returns to not-reached/open.
-   Only the organizer can lock or unlock an order.
-   Locked orders cannot accept new participants or item edits.
-   Unlocking should require organizer confirmation and return the order
    to an editable state.
-   Terminal states (`COMPLETED`, `CANCELLED`, `EXPIRED`) cannot be
    reopened by ordinary users.
-   Expiry must be enforced by backend logic, not only by a client
    timer.
-   All state transitions should be validated server-side.

------------------------------------------------------------------------

## 9. Business Rules and Calculations

### 9.1 Money representation

Store all money as integer paise, not floating-point rupees.

Examples: - ₹199.00 = `19900` - ₹85.00 = `8500` - ₹225.00 = `22500`

Format paise as INR in the UI.

### 9.2 Item subtotal

For each item:

`itemSubtotalPaise = unitPricePaise × quantity`

For each participant:

`participantSubtotalPaise = sum(their item subtotals)`

For the group:

`groupItemSubtotalPaise = sum(all active item subtotals)`

Remaining amount:

`remainingPaise = max(0, minimumAmountPaise - groupItemSubtotalPaise)`

Progress:

`progress = min(100, groupItemSubtotalPaise / minimumAmountPaise × 100)`

Handle a zero threshold safely; threshold must be greater than zero.

### 9.3 Threshold semantics

The threshold is a configurable **item subtotal target** entered by the
organizer. Do not include delivery charges, handling charges, platform
fees, taxes, tips, or other checkout charges when computing this target
unless the organizer explicitly defines a different policy in a future
version.

The actual third-party checkout screen is authoritative. The app must
display a disclaimer: "Reaching this target does not guarantee free
delivery or checkout eligibility. Final fees and eligibility are
determined by the selected platform."

### 9.4 Actual checkout allocation

The organizer may enter: - Actual item amount. - Delivery charge. -
Handling/platform charges. - Taxes or other charges. - Discounts. -
Refunds or adjustments. - Final amount paid at checkout.

For MVP, allocate shared charges proportionally to participant item
subtotals:

`participantShare = participantSubtotal + (participantSubtotal / groupSubtotal × sharedCharges)`

Use integer paise and a deterministic rounding strategy. Ensure all
participant shares sum exactly to the final payable amount. Apply any
rounding remainder to a deterministic participant (e.g. organizer or
last participant by stable ID) and show the adjustment transparently.

If discounts are applied, represent them as explicit adjustments. Do not
silently overwrite original item prices or subtotals.

If group subtotal is zero, do not perform proportional allocation;
require manual allocation or reject finalization.

### 9.5 Product changes and unavailable items

-   A participant can edit their own item while order is open.
-   Organizer may mark an item unavailable during checkout coordination.
-   If an item is unavailable, organizer should contact its owner and
    record whether it was removed or substituted.
-   Substitutions and price changes must be visible in the final
    summary.
-   Keep an audit trail for important changes.

### 9.6 Participant leaving

-   A participant can leave while the order is open.
-   Their items should be removed or marked inactive in a transaction.
-   Recalculate the group total immediately.
-   If the group drops below the threshold, update the progress state.
-   After locking, leaving should require organizer intervention to
    avoid inconsistent payment and checkout records.

------------------------------------------------------------------------

## 10. UI / UX Requirements

### 10.1 Design direction

Build a modern, clean, student-friendly interface. Prioritize mobile
screens because most users will access the app from Android phones.

Suggested design: - Primary: emerald/green. - Background: white or very
light grey. - Text: high contrast, accessible. - Typography: Inter or
Plus Jakarta Sans. - Rounded cards, clear spacing, simple icons. -
Large, readable prices and progress indicators. - Avoid visual clutter
and unnecessary animations.

### 10.2 Navigation

Mobile bottom navigation: - Home - Discover / Join - My Orders - Profile

Desktop: - Sidebar or top navigation with the same destinations.

### 10.3 Required pages

  Page                Purpose
  ------------------- ----------------------------------------------------
  Landing             Explain HostelCart and provide sign-in entry point
  Register / Login    Authentication
  Hostel onboarding   Enter/validate hostel code
  Dashboard           Active orders and create-order action
  Create order        Create a group session
  Join order          Join with code or invitation link
  Order details       Live shared cart and participants
  Add/edit item       Manual and URL-based item forms
  Payment summary     External payment status and contribution amounts
  Checkout summary    Actual checkout amount and allocations
  Order history       Completed, cancelled, expired sessions
  Profile             User information and sign-out
  Admin               Basic hostel/user/report management

### 10.4 Dashboard

Show: - Welcome message. - Create group order button. - Join with code
action. - Active group orders. - Platform badge. - Group total and
threshold progress. - Participant count. - Expiry countdown. - Order
status.

### 10.5 Order details page

Show: - Order title and platform. - Organizer. - Status and expiry. -
Group item subtotal. - Minimum target and remaining amount. - Progress
bar. - Participant list. - Items grouped by participant. - Add product
action when editable. - Share invitation link. - Organizer controls
where authorized.

### 10.6 Accessibility and usability

-   Responsive layouts for mobile, tablet, and desktop.
-   Keyboard-accessible controls.
-   Visible focus states.
-   Form labels and helpful validation messages.
-   Do not communicate status through colour alone.
-   Loading, empty, success, and error states for all major operations.
-   Confirm destructive actions such as removing an item or cancelling
    an order.

------------------------------------------------------------------------

## 11. Proposed Firestore Data Model

Use Firebase Authentication UID as `userId`. Suggested collections:

``` text
users/{userId}
hostels/{hostelId}
orders/{orderId}
orders/{orderId}/items/{itemId}
orders/{orderId}/participants/{userId}
orders/{orderId}/payments/{paymentId}
orders/{orderId}/adjustments/{adjustmentId}
reports/{reportId}
```

### 11.1 `users/{userId}`

``` json
{
  "displayName": "Ajay",
  "email": "student@example.com",
  "hostelId": "HOSTEL_001",
  "role": "student",
  "photoURL": null,
  "createdAt": "Firestore Timestamp",
  "updatedAt": "Firestore Timestamp",
  "isActive": true
}
```

Do not expose email or private profile information to all hostel members
unless required. Room number should be optional and private by default.

### 11.2 `hostels/{hostelId}`

``` json
{
  "name": "Pilot Hostel",
  "university": "University of Hyderabad",
  "inviteCodeHash": "SERVER_GENERATED_HASH",
  "isActive": true,
  "createdAt": "Firestore Timestamp"
}
```

Do not store reusable plain-text invitation secrets if they can be
avoided. Validate invitation codes through trusted backend logic.
Rotate/revoke codes when necessary.

### 11.3 `orders/{orderId}`

``` json
{
  "title": "Sunday Grocery",
  "platform": "blinkit",
  "organizerId": "USER_001",
  "hostelId": "HOSTEL_001",
  "minimumAmountPaise": 19900,
  "groupItemSubtotalPaise": 22500,
  "participantCount": 3,
  "status": "THRESHOLD_REACHED",
  "inviteCode": "SERVER_GENERATED_UNIQUE_CODE",
  "expiresAt": "Firestore Timestamp",
  "createdAt": "Firestore Timestamp",
  "updatedAt": "Firestore Timestamp",
  "lockedAt": null,
  "placedAt": null,
  "completedAt": null
}
```

Treat group totals and participant counts as server-maintained derived
values. Do not trust client writes to these fields.

### 11.4 `orders/{orderId}/items/{itemId}`

``` json
{
  "userId": "USER_001",
  "productName": "Milk",
  "productURL": "https://example.com/product",
  "entryType": "url",
  "quantity": 1,
  "unitPricePaise": 3000,
  "subtotalPaise": 3000,
  "note": "1 litre",
  "isActive": true,
  "createdAt": "Firestore Timestamp",
  "updatedAt": "Firestore Timestamp"
}
```

For manual entry, `productURL` can be null and `entryType` is `manual`.
Use a platform allowlist for links. Validate URLs on both client and
server.

### 11.5 `orders/{orderId}/participants/{userId}`

``` json
{
  "userId": "USER_001",
  "displayName": "Ajay",
  "subtotalPaise": 8500,
  "paymentStatus": "PENDING",
  "joinedAt": "Firestore Timestamp",
  "leftAt": null,
  "isActive": true
}
```

Payment status values: - `PENDING` - `PAID_REPORTED` - `WAIVED` -
`REFUNDED` - `DISPUTED`

`PAID_REPORTED` means a user or organizer has reported payment; it is
not independently verified by HostelCart.

### 11.6 `orders/{orderId}/payments/{paymentId}`

``` json
{
  "userId": "USER_001",
  "amountPaise": 8500,
  "status": "PAID_REPORTED",
  "paymentMethod": "UPI_EXTERNAL",
  "reference": null,
  "reportedBy": "USER_001",
  "createdAt": "Firestore Timestamp",
  "updatedAt": "Firestore Timestamp"
}
```

Do not store UPI PINs, bank credentials, card details, or sensitive
payment authentication data. Do not imply that a reported payment has
been verified by a bank.

### 11.7 `orders/{orderId}/adjustments/{adjustmentId}`

``` json
{
  "type": "DELIVERY_CHARGE",
  "description": "Delivery charge from actual checkout",
  "amountPaise": 1500,
  "allocationMethod": "PROPORTIONAL",
  "createdBy": "USER_001",
  "createdAt": "Firestore Timestamp"
}
```

Support explicit adjustment types such as: - `DELIVERY_CHARGE` -
`HANDLING_CHARGE` - `PLATFORM_FEE` - `TAX` - `DISCOUNT` - `REFUND` -
`SUBSTITUTION` - `OTHER`

### 11.8 `reports/{reportId}`

``` json
{
  "reporterId": "USER_001",
  "reportedUserId": "USER_002",
  "orderId": "ORDER_001",
  "reason": "Payment dispute",
  "details": "Optional explanation",
  "status": "OPEN",
  "createdAt": "Firestore Timestamp"
}
```

------------------------------------------------------------------------

## 12. Backend and Data Integrity

Use Firebase Cloud Functions (or another trusted server environment) for
privileged operations.

Recommended callable/HTTP functions: - `createOrder` - `joinOrder` -
`leaveOrder` - `addItem` - `updateItem` - `removeItem` - `lockOrder` -
`unlockOrder` - `updatePaymentAcknowledgement` -
`finalizeCheckoutSummary` - `transitionOrderStatus` - `expireOrders`

The exact implementation can use callable functions or authenticated
HTTPS endpoints. Validate Firebase Authentication and authorization on
every operation.

### Critical integrity requirements

1.  Recalculate item and participant totals on the backend.
2.  Use Firestore transactions or carefully designed atomic operations
    for concurrent updates.
3.  Never accept a client-supplied group total as authoritative.
4.  Validate order status before every mutation.
5.  Validate the user is a participant before allowing item changes.
6.  Validate only the organizer can perform organizer operations.
7.  Generate invitation codes securely and prevent collisions.
8.  Enforce expiry server-side.
9.  Keep an audit trail for important status and financial adjustments.
10. Use idempotency protections for operations that may be retried.

------------------------------------------------------------------------

## 13. Firestore Security Requirements

Implement restrictive Firestore Security Rules.

  -----------------------------------------------------------------------
  Resource/action                     Permission
  ----------------------------------- -----------------------------------
  Read own user profile               Authenticated owner

  Update own safe profile fields      Authenticated owner

  Change role/hostel membership       Trusted backend/admin only

  Read hostel order                   Active member of same hostel

  Create order                        Authenticated active hostel member

  Read order items                    Active participant or authorized
                                      hostel member, according to order
                                      visibility policy

  Create item                         Item owner, through validated
                                      backend

  Edit/delete item                    Item owner while order is open

  Lock/unlock order                   Organizer through validated backend

  Change order status                 Organizer/backend according to
                                      transition rules

  Read payment acknowledgement        Relevant participant and organizer

  Create payment acknowledgement      Relevant participant or organizer

  Manage hostel                       Admin/backend only

  Manage reports                      Reporter for own report; admin for
                                      review
  -----------------------------------------------------------------------

Prefer routing sensitive writes through Cloud Functions rather than
allowing clients to update aggregate fields directly.

Use Firebase App Check where supported. Add rate limits or abuse
controls to invitation-code validation and order creation. Never rely on
hiding UI controls as a security mechanism.

------------------------------------------------------------------------

## 14. Product URL Validation and Safety

Supported product links should be limited to known platform domains and
legitimate subdomains.

Requirements: - Accept only `https`. - Reject `javascript:`, `data:`,
`file:`, and other unsafe schemes. - Validate hostname using an explicit
allowlist. - Do not trust the visible text of a link. - Open external
links with safe browser options. - Do not make backend requests to
arbitrary user-supplied URLs. - Do not scrape or bypass login, bot
protection, or access controls. - Display the link as an external
reference; users manually confirm name and price.

The exact domain allowlist should be configurable and reviewed before
launch, because platforms may use multiple legitimate domains and
redirect hosts.

------------------------------------------------------------------------

## 15. Notifications

MVP notifications: - User joined an order. - New item added. - Threshold
reached. - Order about to expire. - Organizer locked the order. -
Payment acknowledgement updated. - Order marked placed or completed. -
Order cancelled.

Start with in-app notifications and clear live status updates. Browser
push notifications can be added if time permits; they must be opt-in and
work only where browser support and permissions allow.

Do not make push notifications a blocker for the first usable MVP.

------------------------------------------------------------------------

## 16. Error, Empty, and Edge States

Handle at least these cases:

  -----------------------------------------------------------------------
  Scenario                            Expected behaviour
  ----------------------------------- -----------------------------------
  Invalid invitation code             Clear error; do not reveal private
                                      order details

  Order expired                       Prevent joining and editing

  Order locked                        Display read-only cart

  User not in hostel                  Prevent joining

  Duplicate join                      Keep one participant record

  Participant leaves                  Remove/deactivate their items and
                                      recalculate

  Item price changes                  Update subtotal and recalculate

  Item unavailable                    Organizer records
                                      removal/substitution and informs
                                      owner

  Threshold drops below target        Update progress immediately

  Concurrent edits                    Preserve independent changes;
                                      reject stale invalid writes

  Organizer cancels                   Notify participants and freeze
                                      order

  Payment disputed                    Mark as disputed; do not claim
                                      verified payment

  Checkout total differs              Organizer enters actual amount and
                                      app recalculates shares

  Network failure                     Show retry state without duplicate
                                      writes

  Function retry                      Use idempotency to avoid duplicate
                                      items or adjustments
  -----------------------------------------------------------------------

------------------------------------------------------------------------

## 17. Non-Functional Requirements

### Performance

-   Dashboard should load quickly on ordinary mobile connections.
-   Use pagination for order history and large item lists.
-   Avoid unnecessary Firestore listeners.
-   Unsubscribe listeners when leaving pages.
-   Use optimistic UI carefully; reconcile with server-confirmed data.

### Reliability

-   Use transactions for critical updates.
-   Handle offline/network interruptions gracefully.
-   Avoid duplicate writes on retries.
-   Keep order status transitions consistent.

### Security and privacy

-   Enforce least-privilege access.
-   Collect only necessary user data.
-   Keep private profile information private.
-   Do not expose room numbers or contact details by default.
-   Do not store payment credentials.
-   Provide a way to report abuse.
-   Review applicable Indian privacy and data-protection obligations
    before public launch.

### Compatibility

-   Current Chrome on Android.
-   Current desktop Chrome, Edge, and Firefox.
-   Responsive mobile, tablet, and desktop layouts.

### Maintainability

-   Use TypeScript.
-   Keep Firebase access in service modules.
-   Keep calculation functions pure and unit-tested.
-   Keep UI components reusable.
-   Use environment variables for configuration.
-   Include a README with local setup and deployment steps.

------------------------------------------------------------------------

## 18. Suggested Technology Stack

  Layer               Technology
  ------------------- --------------------------------
  Frontend            React + Vite + TypeScript
  Styling             Tailwind CSS
  Icons               Lucide React
  Routing             React Router
  Authentication      Firebase Authentication
  Database            Cloud Firestore
  Real-time updates   Firestore listeners
  Trusted backend     Firebase Cloud Functions
  Abuse protection    Firebase App Check
  Hosting             Vercel
  Version control     GitHub
  Testing             Vitest + React Testing Library

Do not add a separate Express server, MongoDB, Redux, or payment gateway
unless a demonstrated requirement justifies it.

------------------------------------------------------------------------

## 19. Suggested Project Structure

``` text
hostelcart/
├── public/
├── src/
│   ├── assets/
│   ├── components/
│   │   ├── layout/
│   │   ├── orders/
│   │   ├── products/
│   │   └── common/
│   ├── pages/
│   │   ├── LandingPage.tsx
│   │   ├── LoginPage.tsx
│   │   ├── RegisterPage.tsx
│   │   ├── HostelOnboardingPage.tsx
│   │   ├── DashboardPage.tsx
│   │   ├── CreateOrderPage.tsx
│   │   ├── JoinOrderPage.tsx
│   │   ├── OrderDetailsPage.tsx
│   │   ├── PaymentSummaryPage.tsx
│   │   ├── OrderHistoryPage.tsx
│   │   └── ProfilePage.tsx
│   ├── services/
│   │   ├── firebase.ts
│   │   ├── authService.ts
│   │   ├── hostelService.ts
│   │   ├── orderService.ts
│   │   ├── itemService.ts
│   │   └── paymentService.ts
│   ├── hooks/
│   │   ├── useAuth.ts
│   │   └── useOrder.ts
│   ├── utils/
│   │   ├── money.ts
│   │   ├── calculations.ts
│   │   ├── validators.ts
│   │   └── constants.ts
│   ├── types/
│   │   ├── user.ts
│   │   ├── order.ts
│   │   └── product.ts
│   ├── App.tsx
│   └── main.tsx
├── functions/
│   ├── src/
│   └── package.json
├── firestore.rules
├── firestore.indexes.json
├── .env.example
├── package.json
└── README.md
```

------------------------------------------------------------------------

## 20. Development Plan

Build in the following phases. Each phase should be tested before moving
to the next.

### Phase 1 --- Project foundation (Days 1--2)

-   Create React + Vite + TypeScript project.
-   Configure Tailwind.
-   Add routing and shared layout.
-   Create Firebase project and connect the app.
-   Configure environment variables.
-   Set up GitHub repository.
-   Deploy a basic app to Vercel.

**Exit criteria:** App runs locally and on Vercel; Firebase initializes
without exposing secrets.

### Phase 2 --- Authentication and hostel onboarding (Days 3--4)

-   Implement registration and sign-in.
-   Implement protected routes.
-   Create user profile.
-   Create hostel join flow.
-   Validate invitation code through trusted backend.
-   Add sign-out and authentication persistence.

**Exit criteria:** A user can authenticate and join the pilot hostel;
unauthorized users cannot access hostel features.

### Phase 3 --- Group order management (Days 5--7)

-   Create order form.
-   Add platform selection.
-   Add minimum threshold and expiry.
-   Generate invitation code/link.
-   Implement order dashboard.
-   Implement join and leave flows.
-   Add status validation.

**Exit criteria:** Two test users can create and join an order in the
same hostel.

### Phase 4 --- Product management (Days 8--10)

-   Manual item form.
-   Product URL form.
-   Platform URL validation.
-   Quantity and price validation.
-   Edit/delete own items.
-   Group items by participant.

**Exit criteria:** Participants can add and manage their own products
while the order is open.

### Phase 5 --- Real-time collaboration (Days 11--13)

-   Add Firestore listeners.
-   Implement trusted total calculations.
-   Display group subtotal and threshold progress.
-   Display participant subtotals.
-   Handle simultaneous updates.
-   Add loading and connection states.

**Exit criteria:** Two or more browser sessions see consistent cart
updates and totals.

### Phase 6 --- Checkout and payment coordination (Days 14--16)

-   Implement lock/unlock controls.
-   Display payment summary.
-   Record external payment acknowledgements.
-   Enter actual checkout amount and charges.
-   Allocate final shares.
-   Implement placed/completed/cancelled states.

**Exit criteria:** Organizer can freeze the cart, coordinate external
payments, enter actual checkout details, and close the order.

### Phase 7 --- Testing and launch (Days 17--20)

-   Test security rules.
-   Test mobile responsiveness.
-   Test concurrent edits.
-   Test expiry and cancellation.
-   Test calculation edge cases.
-   Test unauthorized access.
-   Add error handling.
-   Deploy production build.
-   Run a controlled pilot with 10--50 hostel students.

**Exit criteria:** All MVP acceptance criteria pass; no critical
security or calculation defects remain.

Timeline is an estimate for focused development, not a guaranteed
delivery date.

------------------------------------------------------------------------

## 21. Testing Plan

### Unit tests

Test: - INR/paise conversions. - Item subtotal. - Participant
subtotal. - Group subtotal. - Remaining amount. - Progress percentage. -
Proportional allocation and rounding. - URL allowlist validation. -
Status transition validation.

### Integration tests

Test: - Registration and sign-in. - Hostel invitation validation. -
Create and join order. - Add/edit/delete item. - Real-time updates. -
Lock/unlock. - Payment acknowledgement. - Final checkout summary. -
Expiry.

### Security tests

Verify: - User A cannot edit User B's items. - A non-organizer cannot
lock an order. - A user from another hostel cannot join a private hostel
order. - Client cannot directly manipulate aggregate totals. - Client
cannot assign itself admin role. - Expired/locked orders reject
writes. - Arbitrary URLs cannot be fetched by the backend.

### Manual acceptance tests

-   Android Chrome.
-   Desktop Chrome.
-   Slow network.
-   Two or more simultaneous participants.
-   Organizer closes browser during an active order.
-   Participant leaves after adding items.
-   Cart falls below threshold after item removal.

------------------------------------------------------------------------

## 22. MVP Acceptance Criteria

The MVP is ready for pilot only when all of these work:

-   [ ] A student can register and sign in.
-   [ ] A student can join the pilot hostel.
-   [ ] An organizer can create an order for each of the three supported
    platforms.
-   [ ] An organizer can set a minimum item subtotal and expiry.
-   [ ] Another student can join using an invitation link/code.
-   [ ] Students can add products manually.
-   [ ] Students can add product URLs and manually confirmed prices.
-   [ ] Students can edit and delete only their own items.
-   [ ] The group cart updates in real time.
-   [ ] Group and participant subtotals are correct.
-   [ ] Threshold progress and remaining amount are correct.
-   [ ] The organizer can lock and unlock an order.
-   [ ] Locked orders reject participant edits.
-   [ ] External payment acknowledgements can be recorded.
-   [ ] Organizer can enter actual checkout charges and adjustments.
-   [ ] Allocated participant shares sum exactly to final checkout
    total.
-   [ ] Organizer can mark an order placed and completed.
-   [ ] Expired and cancelled orders cannot be edited.
-   [ ] Firestore Security Rules and backend authorization are tested.
-   [ ] The application works on Android mobile browsers.

------------------------------------------------------------------------

## 23. Risks and Mitigations

  -----------------------------------------------------------------------
  Risk                                Mitigation
  ----------------------------------- -----------------------------------
  Students do not join orders         Share invite links in existing
                                      hostel groups; keep joining
                                      friction low.

  Organizer does not place the order  Show organizer identity, status,
                                      and clear cancellation process.

  Payment disputes                    Show itemized totals and payment
                                      acknowledgement history.

  Product price changes               Require manual price confirmation
                                      and allow transparent adjustments.

  Product unavailable                 Allow organizer to record
                                      removal/substitution and notify
                                      owner.

  Platform threshold changes          Organizer enters threshold
                                      manually; checkout app remains
                                      authoritative.

  Third-party app has no public API   Keep HostelCart as a coordination
                                      tool, not an automated ordering
                                      tool.

  Malicious links                     Validate platform domains and never
                                      fetch arbitrary URLs server-side.

  Fake payment acknowledgement        Label as reported, not
                                      bank-verified.

  Unauthorized access                 Firebase Security Rules, trusted
                                      backend checks, App Check, and rate
                                      limits.
  -----------------------------------------------------------------------

------------------------------------------------------------------------

## 24. Launch Strategy

Start with one hostel and a controlled pilot.

### Pilot group

-   Recruit 10--15 students for initial testing.
-   Expand to 30--50 students after fixing usability issues.
-   Use real group orders only after security and calculation tests
    pass.
-   Collect feedback after each order.
-   Measure repeat usage and threshold success.

Do not expand to the entire university until the single-hostel workflow
is reliable.

------------------------------------------------------------------------

## 25. Instructions for the AI Coding Agent

You are the senior full-stack engineer responsible for implementing
HostelCart.

### Working principles

1.  Read this entire PRD before coding.
2.  Build a working, production-minded MVP---not just a static UI
    mockup.
3.  Use React, Vite, TypeScript, Tailwind CSS, Firebase Authentication,
    Firestore, and Firebase Cloud Functions as specified.
4.  Use clean modular architecture and reusable components.
5.  Make the UI mobile-first and polished.
6.  Use INR and integer paise for all monetary calculations.
7.  Enforce authorization in trusted backend code and Firestore Security
    Rules.
8.  Never trust client-supplied aggregate totals, participant counts,
    roles, or order status transitions.
9.  Do not implement third-party checkout automation, scraping, or
    unofficial integrations.
10. Do not implement a payment gateway or hold money.
11. Product links are references only; name and price are manually
    confirmed by the user.
12. Include loading, empty, error, and success states.
13. Write unit tests for calculations and validation.
14. Provide `.env.example`, Firestore rules, indexes, Cloud Functions,
    and a clear README.
15. Never put Firebase Admin credentials or private secrets in frontend
    code or Git.
16. Do not claim a feature is complete unless it works and has been
    tested.

### Execution strategy

Work in milestones: - First inspect the existing repository. Do not
overwrite an existing project blindly. - If the repository is empty,
scaffold the project. - Implement Phase 1 and verify it before
proceeding. - Continue phase by phase, keeping the application
runnable. - After each milestone, summarize changed files, completed
functionality, tests run, and remaining issues. - If Firebase
credentials or project configuration are unavailable, create safe
placeholders and document the exact setup steps. Do not fabricate
credentials. - Ask the user only when a genuinely blocking decision or
external credential is required. - Prefer reasonable defaults for minor
design decisions. - Do not leave core functionality as TODOs or fake
buttons. - Do not use mock data as if it were live production data.
Clearly label any demo mode. - Before declaring MVP complete, execute
the acceptance checklist and report any failures honestly.

### Definition of done

The final deliverable must include: - Working responsive web
application. - Authentication and hostel onboarding. - Group order
creation and joining. - Manual and URL-based item entry. - Real-time
shared cart. - Correct threshold and contribution calculations. -
Organizer controls and order lifecycle. - External payment
acknowledgement tracking. - Secure Firestore rules and trusted backend
operations. - Tests and deployment documentation. - Vercel deployment
instructions.

**Priority:** Correctness, security, and a usable end-to-end
order-sharing workflow are more important than adding extra features.
