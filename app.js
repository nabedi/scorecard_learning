import Fastify from "fastify";
import dotenv from "dotenv";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
dotenv.config();

import Client from "@notionhq/client";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const fastify = Fastify({ logger: true });
export default async function (fastify, opts) {
  fastify.register(import("fastify-static"), {
    root: join(__dirname, "public"),
    prefix: "/public/" // optional: default '/'
  });

  const notion = new Client.Client({
    auth: process.env.NOTION_TOKEN
  });

  fastify.get("/", async function (request, reply) {
    return reply.sendFile("index.html"); // serving path.join(__dirname, 'public', 'myHtml.html') directly
  });

  fastify.get("/learning", async function (request, reply) {
    return reply.sendFile("learning.html"); // serving path.join(__dirname, 'public', 'myHtml.html') directly
  });

  fastify.get("/api/get/teams", async function (request, reply) {
    const teams = await notion.databases.query({
      database_id: process.env.TEAMS_DB
    });

    return teams.results;
  });

  fastify.post("/team", async function (request, reply) {
    const { employee_no, name, division, department, reports_to, learning_topic, duration } = request.body;

    console.log("employee no", employee_no);
    const create = await notion.pages.create({
      parent: {
        database_id: process.env.TEAMS_DB
      },
      properties: {
        ID: {
          title:[
            {
              text: {
                content: employee_no
              }
            }
          ]
        },
        "Employee Name": {
          id: 'qQfN', 
          type: 'rich_text',
          rich_text: [
            {
              text: {
                content: name
              }
            }
          ]
        },
        "Division": {
          type: 'select',
          select: {
            name: division,
          }
        },
        "Department": {
          type: 'select',
          select: {
            name: department,
          }
        },
        "Reports To": {
          id: '?;;g',
          type: 'relation',
          relation: [
            {
              id: reports_to,
            }
          ]
        },
        "Learning Topic": {
          type: 'select',
          select: {
            name: learning_topic,
          }
        },
        Duration: {
          number: parseFloat(duration),
        }
      }
    });
    console.log("create", create);

    return create;
  });

  fastify.post("/learning", async function (request, reply) {
    const { employee_no,title } = request.body;

    console.log("employee no", employee_no);
    const create = await notion.pages.create({
      parent: {
        database_id: process.env.LEARNING_DB
      },
      properties: {
        Title: {
          title:[
            {
              text: {
                content: title
              }
            }
          ]
        },
        "Employee No": {
          type: 'relation',
          relation: [
            {
              id: employee_no,
            }
          ]
        },
      }
    });
    console.log("create", create);

    return create;
  });

  fastify.listen(process.env.PORT || 4000, () => {
    console.log("running on port " + process.env.PORT);
  });
}
