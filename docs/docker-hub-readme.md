# 8man - n8n manager 

## Quick reference

- **Repository**: https://github.com/digital-boss/n8n-manager

`8man` is a CLI tool for [n8n](https://github.com/n8n-io/n8n) instances management. It can manage workflows, credentials, community nodes, API Key, owner account. It can upgrade old nodes to new versions (such as http node set node, function / code node etc).

A critical note about [queue mode](https://docs.n8n.io/hosting/scaling/queue-mode/). In queue mode community nodes should be installed in n8n docker image, which used by every worker. So don't use `8man npm` commands for n8n cluster configured in queue mode.

## Use cases

- Save and restore whole n8n instance. Make your n8n instance reproducible and store workflows and community nodes list in git repo.
- Manage multiple n8n instances without need of ssh access. Create 8man config for each n8n instance you have.
- The ability to manage nodes, owner, API key, and workflows opens up the possibility to deploy the n8n instance entirely from the command line which is useful in CI/CD scenarios.
- The functionality that stands apart from n8n management - is upgrade old nodes to new versions. Let's say you have an old instance of n8n and you want to update it. After the upgrade, you also want the workflows to use the new node versions. You can do this via `8man wf update --help`.

General Features:

- Batch entities processing. Means it can download or send a whole list of entities (workflows, credentials, nodes). 
- Interaction with n8n through HTTP REST protocol. No need for ssh access to n8n.

For more information refer to https://github.com/digital-boss/n8n-manager