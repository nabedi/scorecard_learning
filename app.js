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

  fastify.get("/teams", async function (request, reply) {
    return reply.sendFile("teams.html"); // serving path.join(__dirname, 'public', 'myHtml.html') directly
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

  fastify.get("/api/get/users", async function (request, reply) {
    const teams = await notion.users.list({
      auth: process.env.NOTION_TOKEN
    });

    return teams.results;
  });

  fastify.post("/store/team", async function (request, reply) {
    const {name, email, employee_id, title, skills, grade, user, direct_report, lead, manager } = request.body;

    console.log(user)
    const create = await notion.pages.create({
      parent: {
        database_id: process.env.TEAMS_DB
      },
      properties: {
        name: {
          title:[
            {
              text: {
                content: name
              }
            }
          ]
        },
        "employee id": {
          id: "_fX|",
          type: 'rich_text',
          rich_text: [
            {
              text: {
                content: employee_id
              }
            }
          ]
        },
        email: {
          type: 'rich_text',
          rich_text: [
            {
              text: {
                content: email
              }
            }
          ]
        },
        "job title": {
          type: 'rich_text',
          rich_text: [
            {
              text: {
                content: title
              }
            }
          ]
        },
        skills: {
          type: 'multi_select',
          multi_select: [
            {
              name: skills,
            }
          ]
        },
        grade: {
          number: parseFloat(grade),
        },
        user: {
          people:[
            {
              object: "user",
              id: user
            }
          ]
        },
        "direct report": {
          people:[
            {
              object: "user",
              id: direct_report
            }
          ]
        },
        lead: {
          people:[
            {
              object: "user",
              id: lead
            }
          ]
        },
        manager: {
          people:[
            {
              object: "user",
              id: manager
            }
          ]
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
