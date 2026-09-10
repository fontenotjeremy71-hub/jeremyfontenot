# Troubleshooting

## Project Status
IN PROGRESS

## Cloud Sync Agent Validation

The existing Microsoft Entra Cloud Sync agent on `SYNC01` was preserved and not reinstalled.

Validation confirmed:

- Service name: `AADConnectProvisioningAgent`
- Service state: Running
- Startup mode: Automatic
- Service account: existing gMSA
- Entra agent status: Active
- Outbound TCP 443 connectivity to the Cloud Sync bootstrap endpoint: Successful

## gMSA Validation

The provisioning agent runs under:

`JFAD\pGMSA_126bbe50$`

Active Directory validation confirmed that `SYNC01` is authorized to retrieve the gMSA managed password.

A `Test-ADServiceAccount` command executed from `DC01` returned `False`.

This result was not treated as evidence that the gMSA was broken because `Test-ADServiceAccount` validates whether the computer executing the command can use the account. The Cloud Sync gMSA is assigned to `SYNC01`, not `DC01`.

## Performance Counter Permission Issue

The Cloud Sync agent event log initially contained:

- Event ID `12033`
- Error indicating access to the registry key `Global` was denied

The local `Performance Log Users` group on `SYNC01` contained no members.

The Cloud Sync gMSA was added to the local:

`Performance Log Users`

group.

After the agent service was restarted, the previous registry-access error did not recur and the event log reported:

- Event ID `14013`
- `Metrics Agent was initialized successfully.`

## Remaining Performance Counter Event

The agent also logged Event ID `12009` indicating failure to initialize performance counters.

Because:

- the provisioning agent remained Running
- Microsoft Entra reported the agent as Active
- the metrics agent initialized successfully
- user synchronization succeeded
- Password Hash Synchronization succeeded
- group synchronization succeeded
- provisioning logs showed successful processing

the agent was not reinstalled based solely on this event.

## Cloud Sync Provisioning Delay

During group synchronization testing, the newly created `GG-CloudSync-Test` group did not immediately appear in Microsoft Entra.

Initial troubleshooting verified:

- The group existed in Active Directory
- ObjectClass was `group`
- The group was located inside the configured Cloud Sync OU
- The Cloud Sync job contained a Groups attribute mapping
- OU scope was correct
- The provisioning agent was active
- Outbound connectivity was successful

The Cloud Sync Overview later confirmed that Users and Groups provisioning uses a fixed:

`20 minute`

interval.

After the expected provisioning cycle completed, the group appeared successfully in Microsoft Entra with its synchronized member.

This behavior was documented as normal propagation delay rather than a synchronization failure.

## Provision on Demand Limitation Encountered

A group was tested through the AD-to-Entra `Provision on demand` interface.

The request returned:

`ResourceNotFound`

with a message indicating the input entry was not found or was out of scope.

Further inspection of the interface showed that this AD-to-Entra provisioning workflow was operating on user objects.

The group test result was therefore not used as evidence of a failed group synchronization.

## Final Health Validation

At the end of testing:

- Cloud Sync configuration: Healthy
- Cloud Sync agent: Active
- Users synchronized: 4
- Groups synchronized: 1
- Password Hash Sync: Enabled
- Provisioning failure filter for the final validation window: No results

## Troubleshooting Principle

The environment was troubleshot from observed evidence rather than by reinstalling Cloud Sync or changing scope without cause.

The working synchronization infrastructure was preserved throughout the project.
