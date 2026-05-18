# Manual Workflow Actions

This document describes the manual workflow actions available in Quick Actions that allow users to manually initiate policy-specific workflows.

## Overview

The Quick Actions section now includes policy-specific actions that require users to first select which policy they want to work with before proceeding to the actual workflow.

## Available Actions

### 1. Raise a Claim
- **Purpose**: Manually initiate the claim raising process for a motor insurance policy
- **Flow**: 
  1. User clicks "Raise a claim" in Quick Actions
  2. Policy selection panel opens showing only motor insurance policies
  3. User selects a policy
  4. Switches to AI Actions and opens the Raise Claim workflow for the selected policy

### 2. Edit Policy
- **Purpose**: Manually initiate policy editing for any type of insurance policy  
- **Flow**:
  1. User clicks "Edit policy" in Quick Actions
  2. Policy selection panel opens showing all available policies
  3. User selects a policy  
  4. Switches to AI Actions and opens the Edit Policy workflow for the selected policy

## Technical Implementation

### Components

- **PolicySelectionPanel**: Reusable component that displays customer policies for selection
  - Shows policy type, name, number, and expiry date
  - Provides appropriate icons based on policy type (Motor/Health/Other)
  - Handles empty state when no policies are available

### Integration Points

- **RightSidebar**: Contains the Quick Actions and policy selection logic
- **RaiseClaimHelloView**: Main container that handles policy action callbacks
- **handlePolicyAction**: Bridge function that connects manual actions to existing workflow system

### Policy Filtering

- **Raise a Claim**: Only shows Motor Insurance policies (health insurance typically doesn't use the same claim process)
- **Edit Policy**: Shows all available policies (any policy can be edited)

## User Experience

1. **Discovery**: Actions are clearly labeled in Quick Actions with descriptive text
2. **Selection**: Clean policy selection interface with clear policy information
3. **Transition**: Smooth transition to AI Actions where the actual workflow takes place
4. **Context**: Workflows are pre-populated with the selected policy information

## Future Enhancements

- Add policy search/filtering for customers with many policies
- Add recently used policies at the top
- Add policy status indicators (active/inactive/expiring)
- Support for other policy-specific actions (renew, cancel, etc.)