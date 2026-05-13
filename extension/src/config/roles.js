// SPDX-License-Identifier: Apache-2.0
//
// Role strings to recognize on a user. Comparison is case-insensitive.
// A user matching neither array is treated as "general" — all credentials
// for which they have a value are shown, with no role-based filtering.

export const roles = {
    student:  ['student', 'students'],
    employee: ['advisor', 'employee', 'faculty', 'instructor', 'staff']
};
