FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS base
WORKDIR /app
EXPOSE 8080

FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src
COPY AIResumeAnalyzer.sln .
COPY src/Backend src/Backend
RUN dotnet restore AIResumeAnalyzer.sln
RUN dotnet publish src/Backend/AIResumeAnalyzer.Api/AIResumeAnalyzer.Api.csproj -c Release -o /app/publish

FROM base AS final
WORKDIR /app
COPY --from=build /app/publish .
ENV ASPNETCORE_URLS=http://+:8080
ENTRYPOINT ["dotnet", "AIResumeAnalyzer.Api.dll"]


