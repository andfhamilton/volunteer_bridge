from django.http import JsonResponse
from django.urls import get_resolver

def list_urls(request):
    """View to list all URLs in the project"""
    resolver = get_resolver()
    urls = []
    
    def collect_urls(resolver, prefix=''):
        for pattern in resolver.url_patterns:
            if hasattr(pattern, 'url_patterns'):
                collect_urls(pattern, prefix + str(pattern.pattern))
            else:
                urls.append(prefix + str(pattern.pattern))
    
    collect_urls(resolver)
    return JsonResponse({'urls': sorted(urls)})
