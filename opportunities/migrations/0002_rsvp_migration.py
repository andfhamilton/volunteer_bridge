from django.db import migrations
def transfer_attendees(apps, schema_editor):
    Event = apps.get_model('opportunities', 'Event')
    RSVP = apps.get_model('opportunities', 'RSVP')
    
    for event in Event.objects.all():
        for user in event.attendees.all():
            RSVP.objects.create(user=user, event=event, status='ATTENDING')

class Migration(migrations.Migration):
    dependencies = [
        ('opportunities', '0001_initial'),
    ] 
    operations = [
        migrations.RunPython(transfer_attendees),
    ]