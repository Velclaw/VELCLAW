# MCP and Connectors

> For the complete documentation index, see [llms.txt](/llms.txt). Markdown versions of documentation pages are available by appending `.md` to the page URL.

In addition to tools you make available to the model with [function calling](https://developers.openai.com/api/docs/guides/function-calling), you can give models new capabilities using **connectors** and **remote MCP servers**. These tools give the model the ability to connect to and control external services when needed to respond to a user's prompt. These tool calls can either be allowed automatically, or restricted with explicit approval required by you as the developer.

- **Connectors** are OpenAI-maintained MCP wrappers for popular services like Google Workspace or Dropbox, like the connectors available in [ChatGPT](https://chatgpt.com).
- **Remote MCP servers** can be any server on the public Internet that implements a remote [Model Context Protocol](https://modelcontextprotocol.io/introduction) (MCP) server.

This guide will show how to use both remote MCP servers and connectors with the Responses API. For Agents API sessions, see [MCP connections](https://developers.openai.com/api/docs/guides/agents-api/tools/mcp), which covers connections from the managed service or from your sandbox.

## Secure MCP Tunnel

If your MCP server is private, on-premises, or behind a firewall, use [Secure MCP Tunnel](https://developers.openai.com/api/docs/guides/secure-mcp-tunnels) to connect it to supported OpenAI products without exposing the server to the public internet. Download the latest public release from [openai/tunnel-client](https://github.com/openai/tunnel-client/releases/latest).

## Quickstart

Check out the examples below to see how remote MCP servers and connectors work through the [Responses API](https://developers.openai.com/api/reference/resources/responses/methods/create). Both connectors and remote MCP servers can be used with the `mcp` built-in tool type.



Using remote MCP servers

    

        Remote MCP servers require a `server_url`. Depending on the server,
        you may also need an OAuth `authorization` parameter containing an
        access token.
    


    Using a remote MCP server in the Responses API

```bash
curl https://api.openai.com/v1/responses \ 
-H "Content-Type: application/json" \ 
-H "Authorization: Bearer $OPENAI_API_KEY" \ 
-d '{
  "model": "gpt-6-astra",
    "tools": [
      {
        "type": "mcp",
        "server_label": "dmcp",
        "server_description": "A Dungeons and Dragons MCP server to assist with dice rolling.",
        "server_url": "https://dmcp-server.deno.dev/mcp",
        "require_approval": "never"
      }
    ],
    "input": "Roll 2d4+1"
  }'
```

```javascript
import OpenAI from "openai";
const client = new OpenAI();

const resp = await client.responses.create({
  model: "gpt-6-astra",
  tools: [
    {
      type: "mcp",
      server_label: "dmcp",
      server_description:
        "A Dungeons and Dragons MCP server to assist with dice rolling.",
      server_url: "https://dmcp-server.deno.dev/mcp",
      require_approval: "never",
    },
  ],
  input: "Roll 2d4+1",
});

console.log(resp.output_text);
```

```python
from openai import OpenAI

client = OpenAI()

resp = client.responses.create(
    model="gpt-6-astra",
    tools=[
        {
            "type": "mcp",
            "server_label": "dmcp",
            "server_description": "A Dungeons and Dragons MCP server to assist with dice rolling.",
            "server_url": "https://dmcp-server.deno.dev/mcp",
            "require_approval": "never",
        },
    ],
    input="Roll 2d4+1",
)

print(resp.output_text)
```

```go
package main

import (
	"context"
	"fmt"

	"github.com/openai/openai-go/v3"
	"github.com/openai/openai-go/v3/responses"
)

func main() {
	client := openai.NewClient()
	tool := responses.ToolParamOfMcp("dmcp")
	tool.OfMcp.ServerDescription = openai.String("A Dungeons and Dragons MCP server to assist with dice rolling.")
	tool.OfMcp.ServerURL = openai.String("https://dmcp-server.deno.dev/mcp")
	tool.OfMcp.RequireApproval = responses.ToolMcpRequireApprovalUnionParam{OfMcpToolApprovalSetting: openai.String("never")}

	response, err := client.Responses.New(context.Background(), responses.ResponseNewParams{
		Model: "gpt-6-astra",
		Tools: []responses.ToolUnionParam{tool},
		Input: responses.ResponseNewParamsInputUnion{OfString: openai.String("Roll 2d4+1")},
	})
	if err != nil {
		panic(err)
	}
	fmt.Println(response.OutputText())
}
```

```java
import com.openai.client.OpenAIClient;
import com.openai.client.okhttp.OpenAIOkHttpClient;
import com.openai.models.responses.ResponseCreateParams;
import com.openai.models.responses.Tool;

ResponseCreateParams params =
    ResponseCreateParams.builder()
        .model("gpt-6-astra")
        .input("Roll 2d4+1")
        .addTool(
            Tool.Mcp.builder()
                .serverLabel("dmcp")
                .serverDescription(
                    "A Dungeons and Dragons MCP server to assist with dice rolling.")
                .serverUrl("https://dmcp-server.deno.dev/mcp")
                .requireApproval(Tool.Mcp.RequireApproval.McpToolApprovalSetting.NEVER)
                .build())
        .build();

client.responses().create(params).output().stream()
    .flatMap(item -> item.message().stream())
    .flatMap(message -> message.content().stream())
    .flatMap(content -> content.outputText().stream())
    .forEach(text -> System.out.println(text.text()));
```

```csharp
using OpenAI.Responses;
#pragma warning disable OPENAI001

string key = Environment.GetEnvironmentVariable("OPENAI_API_KEY")!;
ResponsesClient client = new(key);

CreateResponseOptions options = new() { Model = "gpt-6-astra" };
options.Tools.Add(
    ResponseTool.CreateMcpTool(
        serverLabel: "dmcp",
        serverUri: new Uri("https://dmcp-server.deno.dev/mcp"),
        toolCallApprovalPolicy: GlobalMcpToolCallApprovalPolicy.NeverRequireApproval
    )
);
options.InputItems.Add(ResponseItem.CreateUserMessageItem("Roll 2d4+1"));

ResponseResult response = await client.CreateResponseAsync(options);

Console.WriteLine(response.GetOutputText());
```

```ruby
require "openai"

openai = OpenAI::Client.new

response = openai.responses.create(
  model: "gpt-6-astra",
  tools: [
    {
      type: "mcp",
      server_label: "dmcp",
      server_description: "A Dungeons and Dragons MCP server to assist with dice rolling.",
      server_url: "https://dmcp-server.deno.dev/mcp",
      require_approval: "never"
    }
  ],
  input: "Roll 2d4+1"
)

puts(response.output_text)
```


    It is very important that developers trust any remote MCP server they use with
        the Responses API. A malicious server can exfiltrate sensitive data from
        anything that enters the model's context. Carefully review the 
        **Risks and Safety** section below before using this tool.

  

  

    
Using connectors

    

        Connectors require a `connector_id` parameter, and an OAuth access
        token provided by your application in the `authorization` parameter.
    


    Using connectors in the Responses API

```bash
curl https://api.openai.com/v1/responses \
-H "Content-Type: application/json" \
-H "Authorization: Bearer $OPENAI_API_KEY" \
-d '{
    "model": "gpt-6-astra",
    "tools": [
      {
        "type": "mcp",
        "server_label": "Dropbox",
        "connector_id": "connector_dropbox",
        "authorization": "<oauth access token>",
        "require_approval": "never"
      }
    ],
    "input": "Summarize the Q2 earnings report."
  }'
```

```javascript
import OpenAI from "openai";
const client = new OpenAI();

const resp = await client.responses.create({
  model: "gpt-6-astra",
  tools: [
    {
      type: "mcp",
      server_label: "Dropbox",
      connector_id: "connector_dropbox",
      authorization: "<oauth access token>",
      require_approval: "never",
    },
  ],
  input: "Summarize the Q2 earnings report.",
});

console.log(resp.output_text);
```

```python
import os

from openai import OpenAI

client = OpenAI()
connector_authorization = os.environ["OPENAI_CONNECTOR_AUTHORIZATION"]

resp = client.responses.create(
    model="gpt-6-astra",
    tools=[
        {
            "type": "mcp",
            "server_label": "Dropbox",
            "connector_id": "connector_dropbox",
            "authorization": connector_authorization,
            "require_approval": "never",
        },
    ],
    input="Summarize the Q2 earnings report.",
)

print(resp.output_text)
```

```go
package main

import (
	"context"
	"fmt"

	"github.com/openai/openai-go/v3"
	"github.com/openai/openai-go/v3/responses"
)

func main() {
	client := openai.NewClient()
	tool := responses.ToolParamOfMcp("Dropbox")
	tool.OfMcp.ConnectorID = "connector_dropbox"
	tool.OfMcp.Authorization = openai.String("<oauth access token>")
	tool.OfMcp.RequireApproval = responses.ToolMcpRequireApprovalUnionParam{OfMcpToolApprovalSetting: openai.String("never")}

	response, err := client.Responses.New(context.Background(), responses.ResponseNewParams{
		Model: "gpt-6-astra",
		Tools: []responses.ToolUnionParam{tool},
		Input: responses.ResponseNewParamsInputUnion{OfString: openai.String("Summarize the Q2 earnings report.")},
	})
	if err != nil {
		panic(err)
	}
	fmt.Println(response.OutputText())
}
```

```java
import com.openai.client.OpenAIClient;
import com.openai.client.okhttp.OpenAIOkHttpClient;
import com.openai.models.responses.ResponseCreateParams;
import com.openai.models.responses.Tool;

String oauthAccessToken = "<oauth access token>";

ResponseCreateParams params =
    ResponseCreateParams.builder()
        .model("gpt-6-astra")
        .input("Summarize the Q2 earnings report.")
        .addTool(
            Tool.Mcp.builder()
                .serverLabel("Dropbox")
                .connectorId(Tool.Mcp.ConnectorId.of("connector_dropbox"))
                .authorization(oauthAccessToken)
                .requireApproval(Tool.Mcp.RequireApproval.McpToolApprovalSetting.NEVER)
                .build())
        .build();

client.responses().create(params).output().stream()
    .flatMap(item -> item.message().stream())
    .flatMap(message -> message.content().stream())
    .flatMap(content -> content.outputText().stream())
    .forEach(text -> System.out.println(text.text()));
```

```csharp
using OpenAI.Responses;
#pragma warning disable OPENAI001

string dropboxToken =
    Environment.GetEnvironmentVariable("DROPBOX_OAUTH_ACCESS_TOKEN")!;
string key = Environment.GetEnvironmentVariable("OPENAI_API_KEY")!;
ResponsesClient client = new(key);

CreateResponseOptions options = new() { Model = "gpt-6-astra" };
options.Tools.Add(
    ResponseTool.CreateMcpTool(
        serverLabel: "Dropbox",
        connectorId: McpToolConnectorId.Dropbox,
        authorizationToken: dropboxToken,
        toolCallApprovalPolicy: GlobalMcpToolCallApprovalPolicy.NeverRequireApproval
    )
);
options.InputItems.Add(
    ResponseItem.CreateUserMessageItem("Summarize the Q2 earnings report.")
);

ResponseResult response = await client.CreateResponseAsync(options);

Console.WriteLine(response.GetOutputText());
```

```ruby
require "openai"

client = OpenAI::Client.new
response = client.responses.create(
  model: "gpt-6-astra",
  input: "Summarize the Q2 earnings report.",
  tools: [
    {
      type: :mcp,
      server_label: "Dropbox",
      connector_id: "connector_dropbox",
      authorization: "<oauth access token>",
      require_approval: :never
    }
  ]
)

puts(response.output_text)
```



The API will return new items in the `output` array of the model response. If the model decides to use a Connector or MCP server, it will first make a request to list available tools from the server, which will create a `mcp_list_tools` output item. From the remote MCP server example above, it contains only one tool definition:

```json
{
  "id": "mcpl_68a6102a4968819c8177b05584dd627b0679e572a900e618",
  "type": "mcp_list_tools",
  "server_label": "dmcp",
  "tools": [
    {
      "annotations": null,
      "description": "Given a string of text describing a dice roll...",
      "input_schema": {
        "$schema": "https://json-schema.org/draft/2020-12/schema",
        "type": "object",
        "properties": {
          "diceRollExpression": {
            "type": "string"
          }
        },
        "required": ["diceRollExpression"],
        "additionalProperties": false
      },
      "name": "roll"
    }
  ]
}
```

If the model decides to call one of the available tools from the MCP server, you will also find a `mcp_call` output which will show what the model sent to the MCP tool, and what the MCP tool sent back as output.

```json
{
  "id": "mcp_68a6102d8948819c9b1490d36d5ffa4a0679e572a900e618",
  "type": "mcp_call",
  "approval_request_id": null,
  "arguments": "{\"diceRollExpression\":\"2d4 + 1\"}",
  "error": null,
  "name": "roll",
  "output": "4",
  "server_label": "dmcp"
}
```

Read on in the guide below to learn more about how the MCP tool works, how to filter available tools, and how to handle tool call approval requests.

## How it works

The MCP tool (for both remote MCP servers and connectors) is available in the [Responses API](https://developers.openai.com/api/reference/resources/responses/methods/create) in most recent models. Check MCP tool compatibility for your model [here](https://developers.openai.com/api/docs/models). When you're using the MCP tool, you only pay for [tokens](https://developers.openai.com/api/docs/pricing) used when importing tool definitions or making tool calls. No additional fees apply per tool call.

Below, we'll step through the process the API takes when calling an MCP tool.

### Step 1: Listing available tools

When you specify a remote MCP server in the `tools` parameter, the API will attempt to get a list of tools from the server. The Responses API works with remote MCP servers that support either the Streamable HTTP or the HTTP/SSE transport protocols.

If successful in retrieving the list of tools, a new `mcp_list_tools` output item will appear in the model response output. The `tools` property of this object will show the tools that were successfully imported.

```json
{
  "id": "mcpl_68a6102a4968819c8177b05584dd627b0679e572a900e618",
  "type": "mcp_list_tools",
  "server_label": "dmcp",
  "tools": [
    {
      "annotations": null,
      "description": "Given a string of text describing a dice roll...",
      "input_schema": {
        "$schema": "https://json-schema.org/draft/2020-12/schema",
        "type": "object",
        "properties": {
          "diceRollExpression": {
            "type": "string"
          }
        },
        "required": ["diceRollExpression"],
        "additionalProperties": false
      },
      "name": "roll"
    }
  ]
}
```

As long as the `mcp_list_tools` item is present in the context of an API
  request, the API will not fetch a list of tools from the MCP server again at
  each turn in a [conversation](https://developers.openai.com/api/docs/guides/conversation-state). We
  recommend you keep this item in the model's context as part of every
  conversation or workflow execution to optimize for latency.

#### Filtering tools

Some MCP servers can have dozens of tools, and exposing many tools to the model can result in high cost and latency. If you're only interested in a subset of tools an MCP server exposes, you can use the `allowed_tools` parameter to only import those tools.

Constrain allowed tools

```bash
curl https://api.openai.com/v1/responses \
-H "Content-Type: application/json" \
-H "Authorization: Bearer $OPENAI_API_KEY" \
-d '{
    "model": "gpt-6-astra",
    "tools": [
      {
        "type": "mcp",
        "server_label": "dmcp",
        "server_description": "A Dungeons and Dragons MCP server to assist with dice rolling.",
        "server_url": "https://dmcp-server.deno.dev/mcp",
        "require_approval": "never",
        "allowed_tools": ["roll"]
      }
    ],
    "input": "Roll 2d4+1"
  }'
```

```javascript
import OpenAI from "openai";
const client = new OpenAI();

const resp = await client.responses.create({
  model: "gpt-6-astra",
  tools: [
    {
      type: "mcp",
      server_label: "dmcp",
      server_description:
        "A Dungeons and Dragons MCP server to assist with dice rolling.",
      server_url: "https://dmcp-server.deno.dev/mcp",
      require_approval: "never",
      allowed_tools: ["roll"],
    },
  ],
  input: "Roll 2d4+1",
});

console.log(resp.output_text);
```

```python
from openai import OpenAI

client = OpenAI()

resp = client.responses.create(
    model="gpt-6-astra",
    tools=[
        {
            "type": "mcp",
            "server_label": "dmcp",
            "server_description": "A Dungeons and Dragons MCP server to assist with dice rolling.",
            "server_url": "https://dmcp-server.deno.dev/mcp",
            "require_approval": "never",
            "allowed_tools": ["roll"],
        }
    ],
    input="Roll 2d4+1",
)

print(resp.output_text)
```

```go
package main

import (
	"context"
	"fmt"

	"github.com/openai/openai-go/v3"
	"github.com/openai/openai-go/v3/responses"
)

func main() {
	client := openai.NewClient()
	tool := responses.ToolParamOfMcp("dmcp")
	tool.OfMcp.ServerDescription = openai.String("A Dungeons and Dragons MCP server to assist with dice rolling.")
	tool.OfMcp.ServerURL = openai.String("https://dmcp-server.deno.dev/mcp")
	tool.OfMcp.RequireApproval = responses.ToolMcpRequireApprovalUnionParam{OfMcpToolApprovalSetting: openai.String("never")}
	tool.OfMcp.AllowedTools = responses.ToolMcpAllowedToolsUnionParam{OfMcpAllowedTools: []string{"roll"}}

	response, err := client.Responses.New(context.Background(), responses.ResponseNewParams{
		Model: "gpt-6-astra",
		Tools: []responses.ToolUnionParam{tool},
		Input: responses.ResponseNewParamsInputUnion{OfString: openai.String("Roll 2d4+1")},
	})
	if err != nil {
		panic(err)
	}
	fmt.Println(response.OutputText())
}
```

```java
import com.openai.client.OpenAIClient;
import com.openai.client.okhttp.OpenAIOkHttpClient;
import com.openai.models.responses.ResponseCreateParams;
import com.openai.models.responses.Tool;
import java.util.List;

ResponseCreateParams params =
    ResponseCreateParams.builder()
        .model("gpt-6-astra")
        .input("Roll 2d4+1")
        .addTool(
            Tool.Mcp.builder()
                .serverLabel("dmcp")
                .serverDescription(
                    "A Dungeons and Dragons MCP server to assist with dice rolling.")
                .serverUrl("https://dmcp-server.deno.dev/mcp")
                .requireApproval(Tool.Mcp.RequireApproval.McpToolApprovalSetting.NEVER)
                .allowedToolsOfMcp(List.of("roll"))
                .build())
        .build();

client.responses().create(params).output().stream()
    .flatMap(item -> item.message().stream())
    .flatMap(message -> message.content().stream())
    .flatMap(content -> content.outputText().stream())
    .forEach(text -> System.out.println(text.text()));
```

```csharp
using OpenAI.Responses;
#pragma warning disable OPENAI001

string key = Environment.GetEnvironmentVariable("OPENAI_API_KEY")!;
ResponsesClient client = new(key);

CreateResponseOptions options = new() { Model = "gpt-6-astra" };
options.Tools.Add(
    ResponseTool.CreateMcpTool(
        serverLabel: "dmcp",
        serverUri: new Uri("https://dmcp-server.deno.dev/mcp"),
        allowedTools: new McpToolFilter() { ToolNames = { "roll" } },
        toolCallApprovalPolicy: GlobalMcpToolCallApprovalPolicy.NeverRequireApproval
    )
);
options.InputItems.Add(ResponseItem.CreateUserMessageItem("Roll 2d4+1"));

ResponseResult response = await client.CreateResponseAsync(options);

Console.WriteLine(response.GetOutputText());
```

```ruby
require "openai"

client = OpenAI::Client.new

response = client.responses.create(
  model: "gpt-6-astra",
  input: "Roll 2d4+1",
  tools: [
    {
      ty