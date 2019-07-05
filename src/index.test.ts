import {checkAddress} from "./index";

test("check valid addresses", () => {
  expect(checkAddress("21UQFLdH7WvPZEd8HNwXncHtDwFvv4GRqaN3R4cWyuw2TRZxRtRPb7FFTxfcwwQsqYSD2EqhgVCLsGdRdejAoHFHAHJrxxo")).toBe(true);
  expect(checkAddress("bcnZ6VSM78fQNL5js7VnCybbs3ojLbdAD4DfbdJkUqghYWLqXeEgdyo9UyiAZKnB548DK1ofu8wed3jYCPT62zpf2R97SejoT7")).toBe(true);
});

test("check invalid addresses", () => {
  expect(checkAddress("21UQFLdH7WvPZEd8HNwXncHtDwFvv4GRqaM3R4cWyuw2TRZxRtRPb7FFTxfcwwQsqYSD2EqhgVCLsGdRdejAoHFHAHJrxxo")).toBe(false);
  expect(checkAddress("bcnZ6VSM78fQNL5js7VnCybbs3ojLbdAD4DfcdJkUqghYWLqXeEgdyo9UyiAZKnB548DK1ofu8wed3jYCPT62zpf2R97SejoT7")).toBe(false);
});
