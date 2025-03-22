import { AppError } from "../../utils/index.js";
import { projectDomains } from "../../static/eventsData.mjs";

function getRegistrationsController(
  eventsServices,
  filesServices,
  docServices
) {
  async function getUserRegistration(req, res, next) {
    try {
      const { event_name } = req.params;
      const { email } = req.query;
      const user_email = await eventsServices.getUserRegistration(
        event_name,
        email
      );
      if (!user_email)
        throw new AppError(
          404,
          "fail",
          `Email ${user_email} not registered for ${event_name}`
        );
      res.status(302).json(user);
    } catch (err) {
      next(err);
    }
  }

  async function getRegistration(req, res, next) {
    try {
      const results = await eventsServices.getTicketDetails(req.query.ticket);
      if (!results)
        throw new AppError(
          404,
          "fail",
          "Invalid ticket, registration does not exist"
        );
      if (results.step_no === 4)
        throw new AppError(400, "fail", "Registration under verification");
      if (results.step_no !== 5)
        throw new AppError(400, "fail", "Registration steps incomplete");
      if (results.step_no === 5) res.status(302).json(results);
    } catch (err) {
      next(err);
    }
  }

  async function getRegistrations(req, res, next) {
    try {
      const results = await eventsServices.getRegistrations(
        req.params.event_name
      );
      if (!results) throw new AppError(404, "fail", "No registrations found");
      const processTeams = (name, email, phone) => {
        const names = name.split(',');
        const emails = email.split(',');
        const phones = phone.split(',');
        const teams = phones.map((phone, index) => ({
          name: names[index],
          email: emails[index],
          phone
        }))
        return teams;
      }

      const presentIds = [
        'CO-OT0063', 'CO-OT0105', 'CO-OT0117', 'CO-OT1102', 'CO-OT1107', 'CO-OT1106', 'CO-OT0099', 'CO-OT1125', 'CO-OT1100', 'CO-OT1084', 'CO-OT0068', 'CO-OT0075', 'CO-OT0085', 'CO-OT0091', 'CO-OT0094', 'CO-OT0097', 'CO-OT0125', 'CO-OT1088', 'CO-OT0080', 'CO-OT0093', 'CO-OT0120', 'CO-OT1089', 'CO-OT0123', 'CO-OT1066', 'CO-OT1082', 'CO-OT1096', 'CO-ML1149',  'CO-ML1226',  'CO-ML0250',  'CO-ML0279',  'CO-ML1208',  'CO-ML0147',  'CO-ML1207',  'CO-ML1146',  'CO-ML1224',  'CO-ML1158',  'CO-ML1201',  'CO-ML1264',  'CO-ML1148',  'CO-ML0157', 'CO-ML1269',  'CO-ML1198',  'CO-ML0145',  'CO-ML1187',  'CO-ML1256',  'CO-ML1248',  'CO-ML1216',  'CO-ML1162',  'CO-ML1278',  'CO-ML1141',  'CO-ML1222',  'CO-ML1243',  'CO-ML1225',  'CO-ML1268',  'CO-ML1164',  'CO-ML1163',  'CO-ML0279',  'CO-ML1234',  'CO-ML0152',  'CO-ML1200',  'CO-ML1261',  'CO-ML1271',  'CO-ML1168',  'CO-ML1161',  'CO-ML0170',  'CO-ML1154',  'CO-ML0170',  'CO-ML1154',  'CO-AD0067', 'CO-AD1052', 'CO-AD1098', 'CO-AD0053', 'CO-AD0100', 'CO-AD0044', 'CO-AD0077', 'CO-AD0094', 'CO-AD1046', 'CO-AD1049', 'CO-AD1050', 'CO-AD1054', 'CO-AD1080', 'CO-AD1085', 'CO-AD0043', 'CO-AD0066', 'CO-AD0081', 'CO-AD0082', 'CO-AD1063', 'CO-AD1064', 'CO-AD1092', 'CO-AD1074', 'CO-CN1022', 'CO-CN1034', 'CO-CN0020', 'CO-CN1040', 'CO-CN1027', 'CO-CN1028', 'CO-CN1038', 'CO-ES1009', 'CO-ES1010', 'CO-ES1011', 'CO-ES1012', 'CO-ES1013', 'CO-ES1022', 'CO-ES1024', 'CO-ES1037', 'CO-ES0032', 'CO-ES0035', 'CO-ES0036', 'CO-DS1060', 'CO-DS1004', 'CO-DS1040', 'CO-DS1059', 'CO-DS0003', 'CO-DS0044', 'CO-DS1005', 'CO-DS1042', 'CO-DS0035', 'CO-DS1007', 'CO-DS1061', 'CO-DS0002', 'CO-DS1057'
      ]
      
      const filteredResults = [];

      results.forEach((item, index) => {
        if(presentIds.includes(item.pid)){
          const temp = {id: index,
          pid: item.pid,
          judges_count: item.judges_count || 0,
          evaluations: item.evaluations || "N/A",
          judging_within_allocations: item.judging_within_allocations || 0,
          projectDetails: {
            title: item.title,
            abstract: item.abstract,
            project_type: item.project_type,
            sponsored: item.sponsored,
            company: item.company,
            nda: item.nda,
            domain: item.domain,
            guide_name: item.guide_name,
            guide_email: item.guide_email,
            guide_phone: item.guide_phone,
            hod_email: item.hod_email,
            techfiesta: item.techfiesta,
          },
          teamDetails: processTeams(item.name, item.email, item.phone),
          collegeDetails: {
            college: item.college,
            year: item.year,
            city: item.city,
            district: item.district,
            locality: item.locality,
            mode: item.mode,
          },
          paymentId: item.payment_id,
          }
          filteredResults.push(temp);
        }
      })
      res.status(302).json(filteredResults);
    } catch (err) {
      next(err);
    }
  }

  async function getTicketDetails(req, res, next) {
    try {
      const { ticket } = req.query;
      // // console.log(ticket)
      const results = await eventsServices.getTicketDetails(ticket);
      if (!results)
        throw new AppError(404, "fail", "Invalid ticket exists in cookie");
      delete results["pid"];
      delete results["payment_id"];
      delete results["date"];
      res.status(200).json(results);
    } catch (err) {
      // // console.log('herehere')
      next(err);
    }
  }

  async function getPaymentDetails(req, res, next) {
    try {
      const results = await eventsServices.getPaymentDetails(
        req.query.pid,
        req.params.event_name
      );
      if (!results)
        throw new AppError(
          404,
          "fail",
          "Invalid pid, registration does not exist"
        );
      res.status(302).json(results);
    } catch (err) {
      next(err);
    }
  }

  async function getUserIDFile(req, res, next) {
    try {
      const results = await filesServices.checkFile(req.query.email);
      if (!results)
        throw new AppError(404, "fail", "No file exist for this email");
      res.status(302).json({ data: results.file });
    } catch (err) {
      next(err);
    }
  }

  async function getMembersFromTicket(req, res, next) {
    try {
      const { ticket } = req.signedCookies;
      const results = await eventsServices.getMemberDetails(ticket);
      if (!results)
        throw new AppError(
          404,
          "fail",
          "No members were found"
        );
      res.status(302).json(results);
    } catch (error) {
      next(error);
    }
  }

  async function getMembersFromTicket(req, res, next) {
    try {
      const { ticket } = req.signedCookies;
      const results = await eventsServices.getMemberDetails(ticket);
      if (!results)
        throw new AppError(
          404,
          "fail",
          "No members were found"
        );
      res.status(302).json(results);
    } catch (error) {
      next(error);
    }
  }

  async function getPendingPayments(req, res, next) {
    try {
      const results = await eventsServices.getPendingPayments(
        req.params.event_name
      );
      if (!results) throw new AppError(404, "fail", "No pending payments");
      res.status(200).json(results);
    } catch (err) {
      next(err);
    }
  }

  async function getIncompleteRegistrations(req, res, next) {
    try {
      const results = await eventsServices.getIncompleteRegistrations(
        req.params.event_name
      );
      if (!results) throw new AppError(404, "fail", "No Incomplete Registrations");
      res.status(200).json(results);
    } catch (err) {
      next(err);
    }
  }

  async function getProjectAbstract(req, res, next) {
    try {
      const { pid } = req.body
      const temp = pid.substring(0, 2);
      // // // console.log(pid)
      let event_name;
      if (temp === "IM") event_name = "impetus"
      else if (temp === "CO") event_name = "concepts"
      else res.status(404).json({ msg: "Invalid ID" })

      const abstract = await eventsServices.getAbstractFrompid(pid, event_name);
      res.status(200).json(abstract);
    } catch (err) {
      next(err);
    }
  }

  async function updateProjectAbstract(req, res, next) {
    try {
      const { pid, abstract } = req.body
      const temp = pid.substring(0, 2);
      let event_name;
      if (temp === "IM") event_name = "impetus"
      else if (temp === "CO") event_name = "concepts"
      else throw new AppError(404, "fail", "Invalid ID");

      const updatedAbstract = await eventsServices.updateAbstractFrompid(pid, event_name, abstract);
      res.status(200).json({ pid, updatedAbstract });
    } catch (err) {
      next(err);
    }
  }

  function capitalizeFirstLetter(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  async function getSynopsis(req, res, next) {
    try {
      let event_name = req.params.event_name;
      let team_ids = req.query.team_ids;
      let projects = [];
      let results = {};

      if(team_ids && team_ids !== 'null'){
        team_ids = team_ids.split(',').map(team_id => (`'${team_id.trim()}'`)).join(', ');
        projects = await eventsServices.getProjectsByTeamIds(event_name, team_ids);
      }
      else{
        projects = await eventsServices.getProjects(event_name);
      }
      
      Object.entries(projectDomains).forEach(domain => {
        results[domain[1]] = projects.filter(
          (project) => project.domain === domain[0]
        )
      })
      event_name = capitalizeFirstLetter(event_name);
      const pdfDoc = docServices.synopsisPDF(results, event_name);
      docServices.sendPDF(res, "synopsis", pdfDoc);
    } catch (err) {
      next(err);
    }
  }

  
  async function getRegistrationsCount(req, res, next){
    try {
      const results = await eventsServices.countTicketCategories();
      res.status(200).json(results[0]);
    } catch (error) {
      next(error)
    }
  }
  
  async function backupRegs(req, res, next) {
    try {
      const results = await eventsServices.getBackup();
      await eventsServices.insertBackup(results);

      res.json(results);
    } catch (err) {
      next(err);
    }
  }
  
  return {
    getUserRegistration,
    getRegistration,
    getRegistrations,
    getMembersFromTicket,
    getTicketDetails,
    getPaymentDetails,
    getUserIDFile,
    getPendingPayments,
    getProjectAbstract,
    updateProjectAbstract,
    getSynopsis,
    backupRegs,
    getRegistrationsCount,
    getIncompleteRegistrations,

  };
}

export default getRegistrationsController;
