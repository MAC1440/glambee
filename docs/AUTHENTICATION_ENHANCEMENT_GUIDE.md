# Authentication Enhancement Guide

## Current Implementation Analysis

### Current System:
- **Provider**: Supabase Auth
- **Method**: Phone number + OTP (SMS)
- **Flow**: 
  1. User enters phone number
  2. If user exists → Direct login (no OTP) ⚠️ **Security Issue**
  3. If new user → Send OTP → Verify → Create account
- **Session**: localStorage (client-side only)
- **User Types**: `salon` | `customer`

### Issues Identified:
1. **Direct login without OTP** - Security vulnerability
2. **localStorage session** - Not secure, can be manipulated
3. **No MFA** - Single factor authentication
4. **No session refresh** - Sessions don't expire properly
5. **No rate limiting** - Vulnerable to brute force

---

## Recommended AWS-Based Solutions

### Option 1: AWS Cognito (Recommended) ⭐

**Best for**: Enterprise-grade authentication with phone number support

#### Architecture:
```
User → Next.js App → AWS Cognito → AWS SNS → SMS → User
                    ↓
              JWT Tokens → App
```

#### Features:
- ✅ Phone number as primary credential
- ✅ Built-in OTP/SMS via AWS SNS
- ✅ JWT token management
- ✅ Session management (refresh tokens)
- ✅ MFA support (optional)
- ✅ User pools (salon vs customer)
- ✅ Rate limiting & security
- ✅ Social login (optional)

#### Implementation Overview:

**1. AWS Cognito User Pool Setup:**
```typescript
// Each salon gets its own phone number as username
// User Pool Attributes:
// - phone_number (required, unique)
// - custom:salon_id (for salon users)
// - custom:user_type (salon | customer)
```

**2. Authentication Flow:**
```typescript
// Step 1: Initiate Auth (Send OTP)
const response = await cognitoClient.initiateAuth({
  AuthFlow: 'CUSTOM_AUTH',
  ClientId: COGNITO_CLIENT_ID,
  AuthParameters: {
    'USERNAME': phoneNumber,
    'CHALLENGE_NAME': 'SRP_AUTH'
  }
});

// Step 2: Respond to Challenge (Verify OTP)
const challengeResponse = await cognitoClient.respondToAuthChallenge({
  ClientId: COGNITO_CLIENT_ID,
  ChallengeName: 'CUSTOM_CHALLENGE',
  Session: response.Session,
  ChallengeResponses: {
    'USERNAME': phoneNumber,
    'ANSWER': otpCode
  }
});

// Step 3: Get Tokens
const { AccessToken, RefreshToken, IdToken } = challengeResponse.AuthenticationResult;
```

**3. Session Management:**
```typescript
// Store tokens in httpOnly cookies (server-side)
// Use refresh tokens to get new access tokens
// Access tokens expire in 1 hour
// Refresh tokens expire in 30 days
```

#### Cost Estimate:
- **Cognito**: $0.0055 per MAU (Monthly Active User)
- **SNS SMS**: ~$0.00645 per SMS (varies by country)
- **Total**: ~$0.01-0.02 per user per month

---

### Option 2: AWS Amplify Auth

**Best for**: Quick setup with Next.js integration

#### Features:
- ✅ Built on Cognito (same backend)
- ✅ React/Next.js SDK
- ✅ Simpler API
- ✅ Built-in UI components (optional)
- ✅ Automatic token refresh

#### Implementation:
```typescript
import { signIn, signUp, confirmSignIn } from 'aws-amplify/auth';

// Send OTP
await signIn({
  username: phoneNumber,
  options: {
    authFlowType: 'CUSTOM_WITHOUT_SRP'
  }
});

// Verify OTP
await confirmSignIn({
  challengeResponse: otpCode
});
```

---

### Option 3: AWS SNS + Custom Backend

**Best for**: Full control, custom logic

#### Architecture:
```
User → Next.js API Route → AWS SNS → SMS
     → Supabase/PostgreSQL → Store OTP
     → Verify OTP → Generate JWT → Return
```

#### Implementation:
```typescript
// API Route: /api/auth/send-otp
import { SNSClient, PublishCommand } from "@aws-sdk/client-sns";

const snsClient = new SNSClient({ region: "us-east-1" });

// Generate 6-digit OTP
const otp = Math.floor(100000 + Math.random() * 900000).toString();

// Store OTP in database (expires in 5 minutes)
await supabase.from('otp_verifications').insert({
  phone_number: phoneNumber,
  otp: hashedOtp,
  expires_at: new Date(Date.now() + 5 * 60 * 1000)
});

// Send SMS via AWS SNS
await snsClient.send(new PublishCommand({
  PhoneNumber: phoneNumber,
  Message: `Your verification code is: ${otp}`
}));
```

---

## Recommended Solution: AWS Cognito + Phone Number

### Why Cognito?
1. **Security**: Industry-standard, SOC 2 compliant
2. **Scalability**: Handles millions of users
3. **Features**: MFA, password policies, account recovery
4. **Cost-effective**: Pay per active user
5. **Integration**: Works with AWS services

### Implementation Plan:

#### Phase 1: Setup AWS Cognito
1. Create Cognito User Pool
2. Configure phone number as username
3. Set up custom attributes (salon_id, user_type)
4. Configure SMS via AWS SNS
5. Set up Lambda triggers (optional)

#### Phase 2: Replace Supabase Auth
1. Install AWS SDK: `npm install @aws-sdk/client-cognito-identity-provider`
2. Create auth service wrapper
3. Update Auth.tsx to use Cognito
4. Update VerifyOtp.tsx to use Cognito
5. Remove direct login (security fix)

#### Phase 3: Session Management
1. Replace localStorage with httpOnly cookies
2. Implement token refresh logic
3. Add middleware for route protection
4. Handle token expiration

#### Phase 4: Salon-Specific Authentication
1. Each salon uses its phone number
2. Link salon_id to Cognito user attributes
3. Role-based access control (RBAC)

---

## Code Structure Preview

### New Auth Service (`src/lib/aws/auth-service.ts`):
```typescript
import { CognitoIdentityProviderClient, InitiateAuthCommand, RespondToAuthChallengeCommand } from "@aws-sdk/client-cognito-identity-provider";

export class CognitoAuthService {
  private client: CognitoIdentityProviderClient;
  private clientId: string;

  // Send OTP
  async sendOtp(phoneNumber: string) {
    // Initiate custom auth flow
    // Cognito sends OTP via SNS
  }

  // Verify OTP
  async verifyOtp(phoneNumber: string, otp: string) {
    // Respond to challenge
    // Get tokens (Access, Refresh, ID)
    // Return user session
  }

  // Refresh token
  async refreshToken(refreshToken: string) {
    // Get new access token
  }

  // Get user info
  async getUserInfo(accessToken: string) {
    // Decode ID token or call Cognito API
  }
}
```

### Updated Auth Component:
```typescript
// Always require OTP (remove direct login)
const handleSubmit = async (phoneNumber: string) => {
  // Send OTP via Cognito
  const response = await CognitoAuthService.sendOtp(phoneNumber);
  
  if (response.success) {
    router.push(`/auth/verify?phone=${phoneNumber}`);
  }
};
```

### Session Management:
```typescript
// Server-side cookie management
// middleware.ts or API route
export async function setAuthCookies(tokens: {
  accessToken: string;
  refreshToken: string;
  idToken: string;
}) {
  cookies().set('accessToken', tokens.accessToken, {
    httpOnly: true,
    secure: true,
    sameSite: 'strict',
    maxAge: 3600 // 1 hour
  });
  
  cookies().set('refreshToken', tokens.refreshToken, {
    httpOnly: true,
    secure: true,
    sameSite: 'strict',
    maxAge: 2592000 // 30 days
  });
}
```

---

## Security Enhancements

### 1. Always Require OTP
- ❌ Remove direct login
- ✅ Always send OTP for authentication

### 2. Rate Limiting
```typescript
// Limit OTP requests per phone number
// Max 3 OTPs per hour per phone
// Use Redis or DynamoDB for tracking
```

### 3. OTP Expiration
- OTP valid for 5 minutes only
- One-time use only
- Auto-invalidate after use

### 4. Session Security
- httpOnly cookies (prevent XSS)
- Secure flag (HTTPS only)
- SameSite: strict (prevent CSRF)
- Token rotation on refresh

### 5. MFA (Optional)
```typescript
// Enable MFA for salon admins
// Use TOTP (Google Authenticator) or SMS
```

---

## Alternative: Hybrid Approach

### Keep Supabase, Add AWS SNS
- Use Supabase Auth for user management
- Use AWS SNS for SMS delivery (more reliable)
- Keep existing database structure
- Minimal code changes

**Implementation:**
```typescript
// Replace Supabase SMS with AWS SNS
import { SNSClient, PublishCommand } from "@aws-sdk/client-sns";

async function sendOtpViaSNS(phoneNumber: string, otp: string) {
  const snsClient = new SNSClient({ region: "us-east-1" });
  
  await snsClient.send(new PublishCommand({
    PhoneNumber: phoneNumber,
    Message: `Your GlamBee verification code is: ${otp}`
  }));
}

// In Supabase Auth trigger or custom function
// Generate OTP → Store in Supabase → Send via AWS SNS
```

---

## Cost Comparison

| Solution | Setup Cost | Per User/Month | SMS Cost |
|----------|-----------|----------------|----------|
| **Supabase Auth** | Free tier | $0 (free tier) | ~$0.01/SMS |
| **AWS Cognito** | Free tier | $0.0055/MAU | ~$0.006/SMS |
| **AWS SNS Only** | Free tier | $0 | ~$0.006/SMS |
| **Hybrid (Supabase + SNS)** | Free tier | $0 | ~$0.006/SMS |

**Recommendation**: Start with **Hybrid Approach** (easiest migration), then move to **AWS Cognito** for better security.

---

## Migration Checklist

### Pre-Migration:
- [ ] Backup current user data
- [ ] Document current auth flow
- [ ] Test OTP delivery
- [ ] Set up AWS account
- [ ] Configure AWS SNS/Cognito

### Migration Steps:
1. [ ] Set up AWS Cognito User Pool
2. [ ] Migrate existing users to Cognito
3. [ ] Update auth service
4. [ ] Update UI components
5. [ ] Test authentication flow
6. [ ] Update session management
7. [ ] Deploy to staging
8. [ ] Test with real users
9. [ ] Deploy to production

### Post-Migration:
- [ ] Monitor error rates
- [ ] Track SMS delivery rates
- [ ] Monitor costs
- [ ] User feedback collection

---

## Phone Number Format

### Current:
- Format: `+921212121212` (with country code)
- Validation: Basic regex

### Recommended:
```typescript
// Use libphonenumber-js for validation
import { parsePhoneNumber, isValidPhoneNumber } from 'libphonenumber-js';

function validatePhone(phone: string) {
  try {
    const phoneNumber = parsePhoneNumber(phone);
    return {
      isValid: phoneNumber.isValid(),
      formatted: phoneNumber.formatInternational(),
      country: phoneNumber.country
    };
  } catch (error) {
    return { isValid: false };
  }
}
```

---

## Salon-Specific Authentication

### Requirements:
- Each salon uses its own phone number
- Salon phone = primary credential
- Link salon_id to user account

### Implementation:
```typescript
// Cognito User Attributes
{
  phone_number: "+921234567890", // Salon's phone
  'custom:salon_id': "salon_123",
  'custom:user_type': "salon",
  'custom:role': "admin" // admin | staff
}

// During login:
1. User enters salon phone number
2. Send OTP to that phone
3. Verify OTP
4. Get salon_id from Cognito attributes
5. Load salon data from database
```

---

## Next Steps

1. **Decide on approach**: Cognito vs Hybrid
2. **Set up AWS account** and services
3. **Create proof of concept** (POC)
4. **Test with sample users**
5. **Plan migration timeline**
6. **Implement in stages**

---

## Questions to Consider

1. **Do you need MFA?** (Recommended for salon admins)
2. **Multi-device support?** (Allow login from multiple devices)
3. **Session duration?** (How long should users stay logged in?)
4. **Password fallback?** (Allow password as alternative to OTP?)
5. **Social login?** (Google, Facebook, etc.)
6. **Staff accounts?** (Multiple users per salon)

---

## Resources

- [AWS Cognito Documentation](https://docs.aws.amazon.com/cognito/)
- [AWS SNS Pricing](https://aws.amazon.com/sns/pricing/)
- [Cognito User Pools](https://docs.aws.amazon.com/cognito/latest/developerguide/cognito-user-identity-pools.html)
- [Next.js Auth with Cognito](https://docs.amplify.aws/react/build-a-backend/auth/)

---

**Note**: This is a planning document. Implementation will be done when you're ready to proceed.

