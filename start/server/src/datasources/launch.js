const { RESTDataSource } = require("apollo-datasource-rest");

class LaunchAPI extends RESTDataSource {
  constructor() {
    super();
    this.baseURL = "https://api.spacexdata.com/v4/";
  }

  async getAllLaunches() {
    const response = await this.get("launches");
    return Array.isArray(response)
      ? Promise.all(response.map((launch) => this.launchReducer(launch)))
      : [];
  }

  async getRocketById({ rocketId }) {
    const response = await this.get(`rockets/${rocketId}`);

    return response;
  }

  async launchReducer(launch) {
    const rocket = await this.getRocketById({ rocketId: launch.rocket });

    return {
      id: launch.flight_number || 0,
      cursor: `${launch.date_unix}`,
      site: launch.launch_site && launch.launch_site.site_name,
      mission: {
        name: launch.name,
        missionPatchSmall: launch.links.patch.small,
        missionPatchLarge: launch.links.patch.large,
      },
      rocket: {
        id: rocket.id || 0,
        name: rocket.name || "N/A",
        type: rocket.type || "N/A",
      },
    };
  }

  async getLaunchById({ launchId }) {
    const response = await this.post("launches/query", {
      query: { flight_number: launchId },
    });
    return this.launchReducer(response.docs[0]);
  }

  getLaunchesByIds({ launchIds }) {
    return Promise.all(
      launchIds.map((launchId) => this.getLaunchById({ launchId }))
    );
  }
}

module.exports = LaunchAPI;
