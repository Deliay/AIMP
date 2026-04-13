import { subaccountService } from '../services/SubaccountService';
import { authService } from '../services/AuthService';
import { SubaccountModel } from '../models/Subaccount';
import { AuthRequestModel } from '../models/AuthRequest';
import { UserModel } from '../models/User';

describe('SubaccountService', () => {
  let parentUserId: string;

  beforeEach(async () => {
    const result = await authService.register({
      email: 'parent@example.com',
      password: 'password123',
    });
    parentUserId = result.userId;
  });

  describe('createSubaccountWithAuthRequest', () => {
    it('should create auth request for subaccount', async () => {
      const result = await subaccountService.createSubaccountWithAuthRequest({
        parentId: parentUserId,
        name: 'data-collector',
        purpose: 'Data collection agent',
        reason: 'Need to collect data from external sources',
      });

      expect(result).toHaveProperty('requestId');
      expect(result).toHaveProperty('status');

      const authRequest = await AuthRequestModel.findById(result.requestId);
      expect(authRequest).toBeTruthy();
      expect(authRequest?.subaccountName).toBe('data-collector');
      expect(authRequest?.subaccountPurpose).toBe('Data collection agent');
      expect(authRequest?.status).toBe('pending');
    });
  });

  describe('approveSubaccount', () => {
    it('should approve pending subaccount request', async () => {
      const { requestId } = await subaccountService.createSubaccountWithAuthRequest({
        parentId: parentUserId,
        name: 'data-collector',
        purpose: 'Data collection agent',
        reason: 'Need it',
      });

      const subaccount = await subaccountService.approveSubaccount(requestId);

      expect(subaccount).toHaveProperty('_id');
      expect(subaccount.name).toBe('data-collector');
      expect(subaccount.purpose).toBe('Data collection agent');
      expect(subaccount.status).toBe('approved');
      expect(subaccount.apiKey).toMatch(/^ak_/);

      const authRequest = await AuthRequestModel.findById(requestId);
      expect(authRequest?.status).toBe('approved');
    });

    it('should throw error for non-existent auth request', async () => {
      await expect(
        subaccountService.approveSubaccount('nonexistent-id')
      ).rejects.toThrow('Auth request not found');
    });

    it('should throw error if request is not pending', async () => {
      const { requestId } = await subaccountService.createSubaccountWithAuthRequest({
        parentId: parentUserId,
        name: 'data-collector',
        purpose: 'Data collection agent',
        reason: 'Need it',
      });

      await subaccountService.approveSubaccount(requestId);

      await expect(
        subaccountService.approveSubaccount(requestId)
      ).rejects.toThrow('Auth request is not pending');
    });
  });

  describe('rejectSubaccount', () => {
    it('should reject pending subaccount request', async () => {
      const { requestId } = await subaccountService.createSubaccountWithAuthRequest({
        parentId: parentUserId,
        name: 'data-collector',
        purpose: 'Data collection agent',
        reason: 'Need it',
      });

      await subaccountService.rejectSubaccount(requestId, 'Insufficient justification');

      const authRequest = await AuthRequestModel.findById(requestId);
      expect(authRequest?.status).toBe('rejected');
      expect(authRequest?.rejectReason).toBe('Insufficient justification');
    });

    it('should throw error for non-existent auth request', async () => {
      await expect(
        subaccountService.rejectSubaccount('nonexistent-id', 'reason')
      ).rejects.toThrow('Auth request not found');
    });
  });

  describe('getSubaccountsByParent', () => {
    it('should return approved subaccounts for parent', async () => {
      const { requestId: ar1 } = await subaccountService.createSubaccountWithAuthRequest({
        parentId: parentUserId,
        name: 'subaccount-1',
        purpose: 'Purpose 1',
        reason: 'Reason 1',
      });

      const { requestId: ar2 } = await subaccountService.createSubaccountWithAuthRequest({
        parentId: parentUserId,
        name: 'subaccount-2',
        purpose: 'Purpose 2',
        reason: 'Reason 2',
      });

      await subaccountService.approveSubaccount(ar1);

      const subaccounts = await subaccountService.getSubaccountsByParent(parentUserId);
      expect(subaccounts).toHaveLength(1);
      expect(subaccounts[0].name).toBe('subaccount-1');
    });

    it('should return empty array for parent with no subaccounts', async () => {
      const subaccounts = await subaccountService.getSubaccountsByParent(parentUserId);
      expect(subaccounts).toHaveLength(0);
    });
  });

  describe('getSubaccountById', () => {
    it('should return subaccount by id', async () => {
      const { requestId } = await subaccountService.createSubaccountWithAuthRequest({
        parentId: parentUserId,
        name: 'data-collector',
        purpose: 'Data collection agent',
        reason: 'Need it',
      });

      const subaccount = await subaccountService.approveSubaccount(requestId);
      const found = await subaccountService.getSubaccountById(subaccount._id.toString());

      expect(found).toBeTruthy();
      expect(found?.name).toBe('data-collector');
    });

    it('should return null for non-existent id', async () => {
      const found = await subaccountService.getSubaccountById('nonexistent-id');
      expect(found).toBeNull();
    });
  });

  describe('approveSubaccount - user creation', () => {
    it('should create User with type=agent when approving', async () => {
      const { requestId } = await subaccountService.createSubaccountWithAuthRequest({
        parentId: parentUserId,
        name: 'agent-subaccount',
        purpose: 'Test agent',
        reason: 'Testing',
      });

      const subaccount = await subaccountService.approveSubaccount(requestId);

      const agentUser = await UserModel.findOne({ email: `subaccount_${subaccount._id}@aimp.local` });
      expect(agentUser).toBeTruthy();
      expect(agentUser?.type).toBe('agent');
      expect(agentUser?.apiKey).toBe(subaccount.apiKey);
    });
  });
});
