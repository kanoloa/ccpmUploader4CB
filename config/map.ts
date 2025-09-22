/*
 *  Configuration for CCPM Excel file
 */

// C C P M
// Sheet number to be read.
const CCPM_SHEET_NUMBER: number = 1;
// Column numbers to be handled.
const CCPM_TYPE: number = 0;
const CCPM_LEVEL: number = 1;
const CCPM_ID: number = 2;
const CCPM_CODE: number = 3;
const CCPM_NAME: number = 4;
const CCPM_STARTED: number  = 13;
const CCPM_STATUS: number = 14;
const CCPM_PREDECESSOR_ID: number = 33;
const CCPM_SUCCESSOR_ID: number = 35;
// To skip the header row, set CCPM_SKIP_HEADER to true.
const CCPM_SKIP_HEADER: boolean = true;

// C O D E B E A M E R
// Codebeamer Custom Field IDs
const CB_TASK_TYPE_FID: number = 1000;
const CB_TASK_LEVEL_FID: number = 10000;
const CB_TASK_ID_FID: number = 10001;
const CB_TASK_CODE_FID: number = 10002;
const CB_TASK_STARTED_FID: number = 10007;
// Definition for Task Type.
const CB_TASK_TYPE_MILESTONE_ID: number = 1;
const CB_TASK_TYPE_GROUP_ID: number = 2;
const CB_TASK_TYPE_TASK_ID: number = 3;
const CB_TASK_TYPE_STRING: string = "ChoiceFieldValue";
const CB_TASK_LEVEL_STRING: string = "DecimalFieldValue";
const CB_TASK_ID_STRING: string = "IntegerFieldValue";
const CB_TASK_CODE_STRING: string = "IntegerFieldValue";
const CB_TASK_STARTED_STRING: string = "BoolFieldValue";

const CB_TASK_STATUS = {
    "未着手": 1,
    "実行中": 3,
    "完了": 7
}

export {
    CCPM_TYPE,
    CCPM_LEVEL,
    CCPM_ID,
    CCPM_CODE,
    CCPM_NAME,
    CCPM_STARTED,
    CCPM_STATUS,
    CCPM_PREDECESSOR_ID,
    CCPM_SUCCESSOR_ID,
    CCPM_SHEET_NUMBER,
    CCPM_SKIP_HEADER,
    CB_TASK_TYPE_FID,
    CB_TASK_LEVEL_FID,
    CB_TASK_ID_FID,
    CB_TASK_CODE_FID,
    CB_TASK_STARTED_FID,
    CB_TASK_TYPE_MILESTONE_ID,
    CB_TASK_TYPE_GROUP_ID,
    CB_TASK_TYPE_TASK_ID,
    CB_TASK_STATUS,
    CB_TASK_TYPE_STRING,
    CB_TASK_LEVEL_STRING,
    CB_TASK_ID_STRING,
    CB_TASK_CODE_STRING,
    CB_TASK_STARTED_STRING,
};
