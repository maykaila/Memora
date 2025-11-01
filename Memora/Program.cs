using FirebaseAdmin;
using Google.Apis.Auth.OAuth2;
using Memora.Services;
using Google.Cloud.Firestore;
using Google.Cloud.Firestore.V1; // <-- ADD THIS NEW USING STATEMENT

var builder = WebApplication.CreateBuilder(args);

// --- Firebase Admin SDK Initialization ---
try
{
    // 1. Load the credential from the file
    var credential = GoogleCredential.FromFile("firebase-key.json");

    // 2. Manually extract the ProjectId from the credential
    // FIX 1: Made 'projectId' nullable (string?) to fix the warning
    string? projectId = null;
    if (credential.UnderlyingCredential is ServiceAccountCredential serviceAccount)
    {
        projectId = serviceAccount.ProjectId;
    }

    // 3. Check if we got a ProjectId
    if (string.IsNullOrEmpty(projectId))
    {
        throw new InvalidOperationException("Could not determine Project ID from 'firebase-key.json'. Is the 'project_id' field missing?");
    }

    // 4. Create the FirebaseApp with the ProjectId explicitly set
    var firebaseApp = FirebaseApp.Create(new AppOptions()
    {
        Credential = credential,
        ProjectId = projectId // Explicitly tell the app what its ID is
    });

    // 5. Create a FirestoreClientBuilder and pass it the credential
    var clientBuilder = new FirestoreClientBuilder
    {
        Credential = credential
    };
    var client = clientBuilder.Build();

    // 6. Create the FirestoreDb instance, passing both the projectId and the credentialed client
    FirestoreDb db = FirestoreDb.Create(projectId, client); 

    // 7. Register the DB as a singleton
    builder.Services.AddSingleton(db); 

    Console.WriteLine("Firebase Admin SDK initialized successfully.");
}
catch (Exception ex)
{
    Console.WriteLine($"Error initializing Firebase Admin SDK: {ex.Message}");
    // This will print the error message from our new 'throw' if it fails
    throw; 
}
// --- End Firebase Init ---

// --- Add CORS Policy ---
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowNextApp",
        policy =>
        {
            policy.WithOrigins("http://localhost:3000") // Your Next.js URL
                  .AllowAnyHeader()
                  .AllowAnyMethod();
        });
});
// --- End CORS ---

builder.Services.AddControllers();

// --- This will now work thanks to 'using Memora.Services;' ---
builder.Services.AddScoped<IUserService, UserService>();
// --- END ---

var app = builder.Build();

// FIX 2: Corrected the typo 'UseHttpsReddenial.fireirection'
// app.UseHttpsRedirection();

app.UseRouting(); 

app.UseCors("AllowNextApp");

app.UseAuthorization(); 

app.MapControllers();

app.Run();