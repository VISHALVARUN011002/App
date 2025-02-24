import {rand, randAvatar, randBoolean, randCurrencyCode, randEmail, randPastDate, randWord} from '@ngneat/falso';
import CONST from '@src/CONST';
import type {Policy} from '@src/types/onyx';

export default function createRandomPolicy(index: number): Policy {
    return {
        id: index.toString(),
        name: randWord(),
        type: rand(Object.values(CONST.POLICY.TYPE)),
        autoReporting: randBoolean(),
        isPolicyExpenseChatEnabled: randBoolean(),
        autoReportingFrequency: rand(Object.values(CONST.POLICY.AUTO_REPORTING_FREQUENCIES)),
        harvesting: {
            enabled: randBoolean(),
        },
        autoReportingOffset: 1,
        preventSelfApprovalEnabled: randBoolean(),
        submitsTo: index,
        outputCurrency: randCurrencyCode(),
        role: rand(Object.values(CONST.POLICY.ROLE)),
        owner: randEmail(),
        ownerAccountID: index,
        avatar: randAvatar(),
        isFromFullPolicy: randBoolean(),
        lastModified: randPastDate().toISOString(),
        pendingAction: rand(Object.values(CONST.RED_BRICK_ROAD_PENDING_ACTION)),
        errors: {},
        customUnits: {},
        errorFields: {},
        approvalMode: rand(Object.values(CONST.POLICY.APPROVAL_MODE)),
    };
}
