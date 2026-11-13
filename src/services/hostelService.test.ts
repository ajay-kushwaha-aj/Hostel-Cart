import { describe, it, expect, beforeEach } from 'vitest';
import { validateAndJoinHostel, getHostelDetails } from './hostelService';
import { PILOT_HOSTEL } from '../utils/constants';

describe('Hostel Service (Phase 2)', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('rejects empty or whitespace invite code', async () => {
    const res = await validateAndJoinHostel('u1', '');
    expect(res.success).toBe(false);
    expect(res.message).toContain('valid invite code');
  });

  it('rejects invalid invite code without exposing internals', async () => {
    const res = await validateAndJoinHostel('u1', 'WRONG_CODE_999');
    expect(res.success).toBe(false);
    expect(res.message).toContain('Invalid invite code');
  });

  it('validates pilot hostel invite code and returns hostel details', async () => {
    const res = await validateAndJoinHostel('u1', PILOT_HOSTEL.defaultInviteCode);
    expect(res.success).toBe(true);
    expect(res.hostel?.id).toBe(PILOT_HOSTEL.id);
    expect(res.hostel?.name).toBe(PILOT_HOSTEL.name);
    expect(res.hostel?.university).toBe(PILOT_HOSTEL.university);
  });

  it('retrieves pilot hostel details by ID', async () => {
    const details = await getHostelDetails(PILOT_HOSTEL.id);
    expect(details).not.toBeNull();
    expect(details?.id).toBe(PILOT_HOSTEL.id);
    expect(details?.name).toBe(PILOT_HOSTEL.name);
  });
});

