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
const CCPM_START_DATE: number = 11;
const CCPM_END_DATE: number = 12;
const CCPM_STARTED: number  = 13;
const CCPM_STATUS: number = 14;
const CCPM_PREDECESSOR_ID: number = 33;
const CCPM_SUCCESSOR_ID: number = 35;
// To skip the header row, set CCPM_SKIP_HEADER to true.
const CCPM_SKIP_HEADER: boolean = true;

//
// C O D E B E A M E R
//
// Codebeamer Field IDs
const CB_SUMMARY_FID: number = 3
const CB_STATUS_FID: number = 7;
const CB_START_DATE_FID: number = 8;
const CB_END_DATE_FID: number = 9;
const CB_PARENT_FID: number = 76;
const CB_DESCRIPTION_FID: number = 80;
const CB_TASK_TYPE_FID: number = 1000;
const CB_TASK_LEVEL_FID: number = 10000;
const CB_TASK_ID_FID: number = 10001;
const CB_TASK_CODE_FID: number = 10002;
const CB_TASK_STARTED_FID: number = 10007;
const CB_TASK_PREDECESSOR_FID: number = 10016;
const CB_TASK_SUCCESSOR_FID: number = 10017;
//
// Definition for Task Type.
const CB_TASK_TYPE_MILESTONE_ID: number = 1;
const CB_TASK_TYPE_GROUP_ID: number = 2;
const CB_TASK_TYPE_TASK_ID: number = 3;
const CB_TASK_TYPE_GOAL_ID: number = 4;
//
// Field type definitions.
const CB_SUMMARY_STRING: string = "TextFieldValue"
const CB_STATUS_STRING: string = "ChoiceFieldValue";
const CB_TASK_TYPE_STRING: string = "ChoiceFieldValue";
const CB_TASK_TYPE_VALUE_TYPE_STRING: string = "ChoiceOptionReference"
const CB_TASK_LEVEL_STRING: string = "DecimalFieldValue";
const CB_TASK_ID_STRING: string = "IntegerFieldValue";
const CB_TASK_CODE_STRING: string = "IntegerFieldValue";
const CB_TASK_STARTED_STRING: string = "BoolFieldValue";
const CB_TASK_STATUS_STRING: string = "ChoiceOptionReference";
const CB_TASK_PREDECESSOR_STRING = "TextFieldValue";
const CB_TASK_SUCCESSOR_STRING = "TextFieldValue";
const CB_DATE_STRING: string = "DateFieldValue";

const CB_TASK_STATUS = {
    "未着手": 1,
    "実行中": 2,
    "完了": 3
}

export {
    CCPM_TYPE,
    CCPM_LEVEL,
    CCPM_ID,
    CCPM_CODE,
    CCPM_NAME,
    CCPM_START_DATE,
    CCPM_END_DATE,
    CCPM_STARTED,
    CCPM_STATUS,
    CCPM_PREDECESSOR_ID,
    CCPM_SUCCESSOR_ID,
    CCPM_SHEET_NUMBER,
    CCPM_SKIP_HEADER,
    CB_SUMMARY_FID,
    CB_DESCRIPTION_FID,
    CB_STATUS_FID,
    CB_START_DATE_FID,
    CB_END_DATE_FID,
    CB_PARENT_FID,
    CB_TASK_TYPE_FID,
    CB_TASK_LEVEL_FID,
    CB_TASK_ID_FID,
    CB_TASK_CODE_FID,
    CB_TASK_STARTED_FID,
    CB_TASK_PREDECESSOR_FID,
    CB_TASK_SUCCESSOR_FID,
    CB_TASK_TYPE_MILESTONE_ID,
    CB_TASK_TYPE_GROUP_ID,
    CB_TASK_TYPE_TASK_ID,
    CB_TASK_TYPE_GOAL_ID,
    CB_SUMMARY_STRING,
    CB_STATUS_STRING,
    CB_TASK_STATUS,
    CB_TASK_TYPE_STRING,
    CB_TASK_LEVEL_STRING,
    CB_TASK_ID_STRING,
    CB_TASK_CODE_STRING,
    CB_TASK_STARTED_STRING,
    CB_TASK_STATUS_STRING,
    CB_TASK_TYPE_VALUE_TYPE_STRING,
    CB_TASK_PREDECESSOR_STRING,
    CB_TASK_SUCCESSOR_STRING,
    CB_DATE_STRING,
};
