/*
 *  Configuration for CCPM Excel file
 */

// Sheet number to be read.
const CCPM_SHEET_NUMBER= 1;

// Column numbers to be handled.
const CCPM_TYPE: number = 0;
const CCPM_LEVEL= 1;
const CCPM_ID= 2;
const CCPM_CODE= 3;
const CCPM_NAME= 4;
const CCPM_STATUS= 14;
const CCPM_PREDECESSOR_ID= 33;
const CCPM_SUCCESSOR_ID= 35;

// To skip the header row, set CCPM_SKIP_HEADER to true.
const CCPM_SKIP_HEADER= true;

export {
    CCPM_TYPE,
    CCPM_LEVEL,
    CCPM_ID,
    CCPM_CODE,
    CCPM_NAME,
    CCPM_STATUS,
    CCPM_PREDECESSOR_ID,
    CCPM_SUCCESSOR_ID,
    CCPM_SHEET_NUMBER,
    CCPM_SKIP_HEADER
};
